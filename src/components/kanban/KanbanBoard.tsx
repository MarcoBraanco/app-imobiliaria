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
  const pointerXRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 15 },
  })
  const sensors = useSensors(pointerSensor, touchSensor)

  // JS snap-on-idle: snap to nearest column when user stops scrolling (no drag active)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let debounceTimer: ReturnType<typeof setTimeout>

    function handleScroll() {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        if (activeId) return
        const containerRect = container!.getBoundingClientRect()
        const children = Array.from(container!.children) as HTMLElement[]
        if (children.length === 0) return

        let closestOffset = 0
        let closestDist = Infinity
        for (const child of children) {
          const childRect = child.getBoundingClientRect()
          const dist = Math.abs(childRect.left - containerRect.left)
          if (dist < closestDist) {
            closestDist = dist
            closestOffset = container!.scrollLeft + (childRect.left - containerRect.left)
          }
        }
        container!.scrollTo({ left: closestOffset, behavior: 'smooth' })
      }, 150)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(debounceTimer)
    }
  }, [activeId])

  // rAF auto-scroll during drag
  const startAutoScroll = useCallback(() => {
    function tick() {
      const container = scrollContainerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const x = pointerXRef.current
      const edgeThreshold = 60
      const maxSpeed = 15

      const distFromRight = rect.right - x
      const distFromLeft = x - rect.left

      if (distFromRight < edgeThreshold && distFromRight > 0) {
        const speed = Math.round(maxSpeed * (1 - distFromRight / edgeThreshold))
        container.scrollLeft += speed
      } else if (distFromLeft < edgeThreshold && distFromLeft > 0) {
        const speed = Math.round(maxSpeed * (1 - distFromLeft / edgeThreshold))
        container.scrollLeft -= speed
      }

      rafIdRef.current = requestAnimationFrame(tick)
    }
    rafIdRef.current = requestAnimationFrame(tick)
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    pointerXRef.current = e.clientX
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      pointerXRef.current = e.touches[0].clientX
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
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    startAutoScroll()
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

  function cleanupDragListeners() {
    stopAutoScroll()
    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('touchmove', handleTouchMove)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    cleanupDragListeners()

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
    cleanupDragListeners()
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
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
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
