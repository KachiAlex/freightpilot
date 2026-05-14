import { useMemo } from 'react'
import { MapPinIcon, ClockIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression, LatLngTuple } from 'leaflet'

interface MapPlaceholderProps {
  pickup: string
  dropoff: string
  pickupCoords?: LatLngTuple | null
  dropoffCoords?: LatLngTuple | null
  distanceMiles?: string | number | null
  driveHours?: string | number | null
}

const createMarkerIcon = (color: string) =>
  L.divIcon({
    className: 'route-marker',
    html: `<span style="display:inline-block;width:16px;height:16px;border-radius:9999px;border:2px solid white;background:${color};box-shadow:0 0 12px ${color};"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

const pickupIcon = createMarkerIcon('#38bdf8')
const dropoffIcon = createMarkerIcon('#f97316')
const restStopIcon = createMarkerIcon('#cbd5f5')
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
const mapboxStyle = import.meta.env.VITE_MAPBOX_STYLE ?? 'mapbox/streets-v11'
const tileUrl = mapboxToken
  ? `https://api.mapbox.com/styles/v1/${mapboxStyle}/tiles/256/{z}/{x}/{y}?access_token=${mapboxToken}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttribution = mapboxToken
  ? '© Mapbox © OpenStreetMap contributors'
  : '© OpenStreetMap contributors'

const computeRestStops = (start: LatLngTuple, end: LatLngTuple, count = 2): LatLngTuple[] => {
  if (count <= 0) return []
  const [startLat, startLng] = start
  const [endLat, endLng] = end
  return Array.from({ length: count }, (_, index) => {
    const ratio = (index + 1) / (count + 1)
    return [startLat + (endLat - startLat) * ratio, startLng + (endLng - startLng) * ratio]
  })
}

export const MapPlaceholder = ({ pickup, dropoff, pickupCoords, dropoffCoords, distanceMiles, driveHours }: MapPlaceholderProps) => {
  const hasCoords = Boolean(pickupCoords && dropoffCoords)

  const restStops = useMemo(() => {
    if (!hasCoords || !pickupCoords || !dropoffCoords) {
      return []
    }
    return computeRestStops(pickupCoords, dropoffCoords)
  }, [hasCoords, pickupCoords, dropoffCoords])

  const routePoints = useMemo(() => {
    if (!hasCoords || !pickupCoords || !dropoffCoords) {
      return []
    }
    return [pickupCoords, ...restStops, dropoffCoords]
  }, [hasCoords, pickupCoords, dropoffCoords, restStops])

  const bounds = useMemo(() => {
    if (!routePoints.length) return null
    const latLngs = routePoints.map(([lat, lng]) => L.latLng(lat, lng))
    return L.latLngBounds(latLngs)
  }, [routePoints])

  const statBlocks = [
    {
      label: 'Distance',
      value: distanceMiles ? `${distanceMiles} mi` : '—',
      icon: <ArrowsRightLeftIcon className="h-4 w-4 text-sky" />,
    },
    {
      label: 'Drive time est.',
      value: driveHours ? `${driveHours} hrs` : '—',
      icon: <ClockIcon className="h-4 w-4 text-amber" />,
    },
  ]

  const fallbackContent = (
    <div className="mt-6 rounded-2xl border border-white/5 bg-black/40 px-4 py-8 text-center text-sm text-slate">
      Enter trip locations or open an existing trip with geocoded coordinates to unlock live polylines, map tiles, and rest-stop suggestions.
    </div>
  )

  return (
    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-horizon/30 via-black/40 to-midnight/70 p-6 text-white">
      <p className="text-sm uppercase tracking-[0.4em] text-slate/70">Route visualization</p>
      <div className="mt-6 grid gap-4 text-sm">
        <div className="flex items-center gap-3">
          <MapPinIcon className="h-5 w-5 text-sky" />
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Pickup</p>
            <p className="text-lg font-semibold">{pickup || 'Awaiting input'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPinIcon className="h-5 w-5 text-amber" />
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Dropoff</p>
            <p className="text-lg font-semibold">{dropoff || 'Awaiting input'}</p>
          </div>
        </div>
      </div>

      {hasCoords && bounds ? (
        <MapContainer
          key={`${pickupCoords?.join(',')}-${dropoffCoords?.join(',')}`}
          bounds={bounds}
          scrollWheelZoom={false}
          className="mt-6 h-64 w-full rounded-2xl border border-white/5"
        >
          <TileLayer attribution={tileAttribution} url={tileUrl} />
          <Polyline positions={routePoints as LatLngExpression[]} pathOptions={{ color: '#38bdf8', weight: 4 }} />
          {pickupCoords && (
            <Marker position={pickupCoords as LatLngExpression} icon={pickupIcon}>
              <Tooltip>Pickup · {pickup}</Tooltip>
            </Marker>
          )}
          {dropoffCoords && (
            <Marker position={dropoffCoords as LatLngExpression} icon={dropoffIcon}>
              <Tooltip>Dropoff · {dropoff}</Tooltip>
            </Marker>
          )}
          {restStops.map((point, index) => (
            <Marker key={`rest-${index}`} position={point as LatLngExpression} icon={restStopIcon}>
              <Tooltip>Planned rest stop #{index + 1}</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        fallbackContent
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {statBlocks.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            {stat.icon}
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate/70">{stat.label}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-slate/80">
        Powered by Leaflet + OpenStreetMap tiles. Mapbox integration can drop in atop these coordinates when advanced telemetry is ready.
      </p>
    </div>
  )
}
