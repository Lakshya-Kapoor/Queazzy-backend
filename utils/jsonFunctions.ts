export default function json(data: Object) {
  return JSON.stringify(data);
}

export function errorMsg(data: string) {
  return json({ error: data });
}

export function successMsg(data: string) {
  return json({ success: data });
}
