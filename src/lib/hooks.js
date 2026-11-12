import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from './firebase.js'

export function useCollection(path, { ordered = true } = {}) {
  const [items, setItems] = useState([])
  useEffect(() => {
    if (!path) return undefined
    const ref = collection(db, path)
    const q = ordered ? query(ref, orderBy('createdAt', 'asc')) : ref
    return onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
  }, [path, ordered])
  return items
}

export function useDocument(path) {
  const [data, setData] = useState(undefined)
  useEffect(() => {
    if (!path) return undefined
    return onSnapshot(doc(db, path), (snap) => setData(snap.exists() ? snap.data() : null))
  }, [path])
  return data
}
