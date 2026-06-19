export function hasOrigin(form) {
  const lat = String(form.origin_lat ?? '').trim();
  const lng = String(form.origin_lng ?? '').trim();
  return lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

export function hasDestination(form) {
  const lat = String(form.dest_lat ?? '').trim();
  const lng = String(form.dest_lng ?? '').trim();
  return lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

export function hasRouteEndpoints(form) {
  return hasOrigin(form) && hasDestination(form);
}
