import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'

const ALLOWED_HOSTS = [
  'www.lagoimobiliaria.com.br',
  'lagoimobiliaria.com.br',
  'www.imobiliariapiramide.com.br',
  'imobiliariapiramide.com.br',
]

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
}

interface ScrapedData {
  titulo: string
  codigoImovel: string
  bairro: string
  aluguel: string
  condominio: string
  iptu: string
  quartos: number
  banheiros: number
  area: string
  imobiliaria: string
  linkAnuncio: string
  fotos: string
  descricao: string
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&oacute;/g, 'ó')
    .replace(/&aacute;/g, 'á')
    .replace(/&atilde;/g, 'ã')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&otilde;/g, 'õ')
    .replace(/&iacute;/g, 'í')
    .replace(/&uacute;/g, 'ú')
    .replace(/&sup2;/g, '²')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function extractBairroFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const segments = pathname.split('/').filter(Boolean)
    // URL pattern: /alugar|comprar/Cidade/Tipo/Subtipo/Bairro/Codigo
    // Bairro is the second-to-last segment
    if (segments.length >= 2) {
      const bairro = segments[segments.length - 2]
      return bairro.replace(/-/g, ' ')
    }
  } catch {
    // ignore
  }
  return ''
}

function extractNumber(text: string): number {
  const match = text.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

function parsePrice(text: string): string {
  // Remove dots (thousands separator) and trim
  const cleaned = text.trim().replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  if (isNaN(num)) return ''
  // Preserve decimals (e.g. IPTU "83,33" → "83.33")
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)
}

function extractImobiliariaFromHost(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    const map: Record<string, string> = {
      'lagoimobiliaria.com.br': 'Lago Imobiliária',
      'imobiliariapiramide.com.br': 'Pirâmide Imóveis',
    }
    return map[hostname] || ''
  } catch {
    return ''
  }
}

function parseHtml(html: string, url: string): ScrapedData {
  const $ = cheerio.load(html)

  // 1. Extract JSON-LD
  let jsonLd: Record<string, unknown> = {}
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || '{}')
      if (parsed['@type'] === 'Product') {
        jsonLd = parsed
      }
    } catch {
      // ignore malformed JSON-LD
    }
  })

  // 2. Title from JSON-LD or HTML
  const titulo =
    (jsonLd.name as string) ||
    $('h1.titulo-imovel').text().trim() ||
    $('title').text().trim()

  // 3. Photos from JSON-LD with HTML fallback
  let images: string[] = []
  if (Array.isArray(jsonLd.image)) {
    images = jsonLd.image as string[]
  } else if (typeof jsonLd.image === 'string') {
    images = [jsonLd.image]
  }

  // Fallback: scrape images from HTML gallery
  if (images.length === 0) {
    const gallerySelectors = [
      '.carousel img',
      '.galeria img',
      '#galeria img',
      '.swiper-slide img',
      '.fotorama img',
      'img[src*="fotos"]',
      'img[src*="imoveis"]',
      '.foto-imovel img',
    ]
    for (const selector of gallerySelectors) {
      $(selector).each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || ''
        if (src && src.startsWith('http')) {
          images.push(src)
        }
      })
      if (images.length > 0) break
    }
  }

  const fotos = [...new Set(images)].join('\n')

  // 4. Code from JSON-LD or HTML
  const codigoImovel =
    (jsonLd.sku as string) ||
    $('.codigo-imo .fw-bold').text().trim() ||
    ''

  // 5. Brand/Imobiliária from JSON-LD with hostname fallback
  const brand = jsonLd.brand as Record<string, string> | undefined
  const imobiliaria = brand?.name || extractImobiliariaFromHost(url)

  // 6. Link from JSON-LD or original URL
  const offers = jsonLd.offers as Record<string, string> | undefined
  const linkAnuncio = offers?.url || url

  // 7. Description from JSON-LD or HTML
  const rawDescription =
    (jsonLd.description as string) ||
    $('p.descricao-imovel').text().trim() ||
    ''
  const descricao = decodeHtmlEntities(rawDescription)

  // 8. Bairro from URL
  const bairro = extractBairroFromUrl(url)

  // 9. Prices from HTML — look inside .valores_imovel
  let aluguel = ''
  let condominio = ''
  let iptu = ''

  $('.valores_imovel .row').each((_, row) => {
    const label = $(row).find('.col-7').text().trim().toLowerCase()
    const valueEl = $(row).find('.col-5.text-end')
    const value = valueEl.text().trim()

    if (label.includes('aluguel')) {
      aluguel = parsePrice(value)
    } else if (label.includes('condomínio') || label.includes('condominio')) {
      condominio = parsePrice(value)
    } else if (label.includes('iptu')) {
      iptu = parsePrice(value)
    }
  })

  // 10. Quartos from HTML
  const dormTitle = $('.dorm-ico-imo').attr('title') || ''
  const quartos = extractNumber(dormTitle)

  // 11. Banheiros from HTML
  const banhTitle = $('.banh-ico-imo').attr('title') || ''
  const banheiros = extractNumber(banhTitle)

  // 12. Área from HTML
  const areaText =
    $('.a-util-ico-imo strong').text().trim() ||
    $('.a-util-ico-imo .fw-bold').text().trim() ||
    ''
  const areaMatch = areaText.match(/([\d.,]+)\s*m/)
  const area = areaMatch ? areaMatch[1].replace(',', '.') : ''

  return {
    titulo,
    codigoImovel,
    bairro,
    aluguel,
    condominio,
    iptu,
    quartos: quartos || 1,
    banheiros: banheiros || 1,
    area,
    imobiliaria,
    linkAnuncio,
    fotos,
    descricao,
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body as { url?: string }

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL é obrigatória' })
  }

  // Validate URL host
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return res.status(400).json({ error: 'URL inválida' })
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return res.status(400).json({
      error: `Site não suportado. Use URLs da Lago Imobiliária ou Pirâmide Imóveis.`,
    })
  }

  try {
    const response = await fetch(url, { headers: BROWSER_HEADERS })

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: `Erro ao acessar o site: ${response.status}` })
    }

    const html = await response.text()
    const data = parseHtml(html, url)

    return res.status(200).json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return res
      .status(502)
      .json({ error: `Falha ao importar dados: ${message}` })
  }
}
