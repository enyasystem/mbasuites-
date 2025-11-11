"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react"

interface Room {
  id: number
  name: string
  type: string
  price_usd: number
  price_ngn: number
  beds: number
  bathrooms: number
  max_guests: number
  available: boolean
}

export default function StaffRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 1,
      name: "Deluxe Suite",
      type: "Suite",
      price_usd: 250,
      price_ngn: 180000,
      beds: 1,
      bathrooms: 1,
      max_guests: 2,
      available: true,
    },
    {
      id: 2,
      name: "Executive Room",
      type: "Standard",
      price_usd: 150,
      price_ngn: 110000,
      beds: 1,
      bathrooms: 1,
      max_guests: 2,
      available: true,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "Standard",
    price_usd: 0,
    price_ngn: 0,
    beds: 1,
    bathrooms: 1,
    max_guests: 2,
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("price") || name.includes("beds") || name.includes("bathrooms") || name.includes("max_guests")
          ? Number.parseInt(value)
          : value,
    }))
  }

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setRooms(
        rooms.map((r) => (r.id === editingId ? ({ ...formData, id: editingId, available: r.available } as Room) : r)),
      )
      setEditingId(null)
    } else {
      const newRoom: Room = {
        ...formData,
        id: Math.max(...rooms.map((r) => r.id), 0) + 1,
        available: true,
      } as Room
      setRooms([...rooms, newRoom])
    }

    setFormData({
      name: "",
      type: "Standard",
      price_usd: 0,
      price_ngn: 0,
      beds: 1,
      bathrooms: 1,
      max_guests: 2,
    })
    setShowForm(false)
  }

  const handleEdit = (room: Room) => {
    setFormData({
      name: room.name,
      type: room.type,
      price_usd: room.price_usd,
      price_ngn: room.price_ngn,
      beds: room.beds,
      bathrooms: room.bathrooms,
      max_guests: room.max_guests,
    })
    setEditingId(room.id)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    setRooms(rooms.filter((r) => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-serif text-4xl font-bold text-foreground">Manage Rooms</h1>
            <p className="text-lg text-muted-foreground">Add, edit, or remove accommodations</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              if (editingId) {
                setEditingId(null)
                setFormData({
                  name: "",
                  type: "Standard",
                  price_usd: 0,
                  price_ngn: 0,
                  beds: 1,
                  bathrooms: 1,
                  max_guests: 2,
                })
              }
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Room
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="rounded-2xl border bg-card p-6 sticky top-24">
                <h2 className="font-semibold text-foreground mb-6">{editingId ? "Edit Room" : "Add New Room"}</h2>
                <form onSubmit={handleAddRoom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Room Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Deluxe Suite"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Room Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option>Standard</option>
                      <option>Deluxe</option>
                      <option>Suite</option>
                      <option>Presidential</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Price (USD)</label>
                    <input
                      type="number"
                      name="price_usd"
                      value={formData.price_usd}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Price (NGN)</label>
                    <input
                      type="number"
                      name="price_ngn"
                      value={formData.price_ngn}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Beds</label>
                      <input
                        type="number"
                        name="beds"
                        value={formData.beds}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Bathrooms</label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Max Guests</label>
                    <input
                      type="number"
                      name="max_guests"
                      value={formData.max_guests}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                    >
                      {editingId ? "Update" : "Add"} Room
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                        setFormData({
                          name: "",
                          type: "Standard",
                          price_usd: 0,
                          price_ngn: 0,
                          beds: 1,
                          bathrooms: 1,
                          max_guests: 2,
                        })
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border text-foreground font-medium text-sm hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Rooms List */}
          <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
            {rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{room.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {room.type} • {room.max_guests} guests
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          room.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {room.available ? "Available" : "Occupied"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Price (USD)</p>
                        <p className="font-bold text-foreground">${room.price_usd}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Price (NGN)</p>
                        <p className="font-bold text-foreground">₦{room.price_ngn.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Beds</p>
                        <p className="font-bold text-foreground">{room.beds}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Bathrooms</p>
                        <p className="font-bold text-foreground">{room.bathrooms}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-primary font-medium text-sm hover:bg-primary/5 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-destructive font-medium text-sm hover:bg-destructive/5 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed bg-muted/50 p-16 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground font-medium">No rooms added yet</p>
                <p className="text-sm text-muted-foreground mt-2">Click "Add New Room" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
