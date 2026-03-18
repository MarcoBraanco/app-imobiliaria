import { useState, useEffect, useRef, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragMoveEvent,
} from '@dnd-kit/core'
import type { Property, PropertyStatus } from '../../types'
import { KANBAN_COLUMNS } from '../../types'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

interface KanbanBoardProps {
  properties: Property[]
  boardId: string
  updateStatus: (propertyId: string, status: string) => Promise<void>
}

export function KanbanBoard({ properties, boardId, updateStatus }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  // Optimistic status overrides so the card moves instantly without waiting for Firestore
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, PropertyStatus>>({})
  const pendingUpdates = useRef<Set<string>>(new Set())

  // Clear optimistic overrides once Firestore confirms the change
  useEffect(() => {
    setOptimisticStatus((prev) => {
      const next = { ...prev }
      let changed = false
      for (const [propId, status] of Object.entries(next)) {
        const prop = properties.find((p) => p.id === propId)
        if (prop && prop.status === status) {
          delete next[propId]
          pendingUpdates.current.delete(propId)
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [properties])

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 300, tolerance: 10 },
  })
  const sensors = useSensors(pointerSensor, touchSensor)

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const container = scrollContainerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const pointerX = (event.activatorEvent as PointerEvent | TouchEvent)
      ? rect.left + rect.width / 2 + (event.delta?.x ?? 0)
      : rect.left + rect.width / 2

    // Use the active node's projected position
    const activeRect = event.active.rect.current.translated
    if (!activeRect) return
    const activeCenter = activeRect.left + activeRect.width / 2

    const edgeThreshold = 60
    const maxScrollSpeed = 15

    const distFromRight = rect.right - activeCenter
    const distFromLeft = activeCenter - rect.left

    if (distFromRight < edgeThreshold) {
      const speed = Math.round(maxScrollSpeed * (1 - distFromRight / edgeThreshold))
      container.scrollLeft += speed
    } else if (distFromLeft < edgeThreshold) {
      const speed = Math.round(maxScrollSpeed * (1 - distFromLeft / edgeThreshold))
      container.scrollLeft -= speed
    }
  }, [])

  // Apply optimistic status overrides to properties
  const effectiveProperties = properties.map((p) =>
    optimisticStatus[p.id] ? { ...p, status: optimisticStatus[p.id] } : p
  )

  const grouped = KANBAN_COLUMNS.map((col) => ({
    ...col,
    properties: effectiveProperties.filter((p) => p.status === col.status),
  }))

  const activeProperty = activeId ? effectiveProperties.find((p) => p.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const propertyId = active.id as string
    const targetStatus = over.id as PropertyStatus

    // Only update if it's a valid column target
    const isColumn = KANBAN_COLUMNS.some((col) => col.status === targetStatus)
    if (!isColumn) return

    const prop = effectiveProperties.find((p) => p.id === propertyId)
    if (prop && prop.status !== targetStatus) {
      setOptimisticStatus((prev) => ({ ...prev, [propertyId]: targetStatus }))
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) {
      // Dropped outside — revert optimistic change
      const propertyId = active.id as string
      if (!pendingUpdates.current.has(propertyId)) {
        setOptimisticStatus((prev) => {
          const next = { ...prev }
          delete next[propertyId]
          return next
        })
      }
      return
    }

    const propertyId = active.id as string
    const newStatus = over.id as PropertyStatus

    const property = properties.find((p) => p.id === propertyId)
    if (property && property.status !== newStatus) {
      // Keep optimistic state and fire Firestore update
      setOptimisticStatus((prev) => ({ ...prev, [propertyId]: newStatus }))
      pendingUpdates.current.add(propertyId)
      updateStatus(propertyId, newStatus)
    } else {
      // Same column — clear optimistic override
      setOptimisticStatus((prev) => {
        const next = { ...prev }
        delete next[propertyId]
        return next
      })
    }
  }

  function handleDragCancel() {
    setActiveId(null)
    // Revert all non-pending optimistic statuses
    setOptimisticStatus((prev) => {
      const next: Record<string, PropertyStatus> = {}
      for (const [id, status] of Object.entries(prev)) {
        if (pendingUpdates.current.has(id)) {
          next[id] = status
        }
      }
      return next
    })
  }

  const dropAnimation = {
    duration: 250,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)' as const,
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={scrollContainerRef}
        className={`flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 ${
          activeId ? '' : 'snap-x snap-mandatory'
        }`}
      >
        {grouped.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            color={col.color}
            properties={col.properties}
            boardId={boardId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeProperty ? (
          <KanbanCard property={activeProperty} boardId={boardId} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
