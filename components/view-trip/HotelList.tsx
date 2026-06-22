"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { Trash2, Plus, X, Check } from "lucide-react";
import { NavigateDropdown } from "@/components/map/NavigateDropdown";
import { cardReveal, liftHover, pressTap, springSnappy, staggerSoft } from "@/lib/motion";
import type { TripData, TripHotel } from "@/types/trip";

interface HotelListProps {
  hotels?: Partial<TripHotel>[] | null;
  tripData: TripData;
  tripId: string;
  isEditable: boolean;
}

function renderStars(rating?: number | null) {
  const safeRating = Math.max(0, Math.min(5, rating ?? 0));
  const full = Math.floor(safeRating);
  const half = safeRating % 1 >= 0.5;

  return "⭐".repeat(full) + (half ? "✨" : "");
}

function getInitial(name?: string | null) {
  return (name?.trim().charAt(0) || "H").toUpperCase();
}

const cardVariant: Variants = cardReveal;

export default function HotelList({ hotels, tripData, tripId, isEditable }: HotelListProps) {
  const shouldReduceMotion = useReducedMotion();
  const updateTripData = useMutation(api.trips.updateTripData);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newHotel, setNewHotel] = useState({
    name: "",
    address: "",
    price: "",
    rating: 5,
    description: "",
  });

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const addedHotel: Partial<TripHotel> = {
        name: newHotel.name,
        address: newHotel.address,
        price: newHotel.price,
        rating: Number(newHotel.rating),
        description: newHotel.description,
        coordinates: { lat: 13.7563, lng: 100.5018 }, // กรุงเทพฯ เป็นพิกัดเริ่มต้น
      };

      const updatedHotels = [...(hotels || []), addedHotel];
      const updatedTripData = {
        ...tripData,
        hotels: updatedHotels,
      };

      await updateTripData({
        tripId: tripId as Id<"trips">,
        tripData: updatedTripData,
      });

      setShowAddModal(false);
      setNewHotel({ name: "", address: "", price: "", rating: 5, description: "" });
    } catch (err) {
      console.error("Failed to add hotel:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHotel = async (indexToDelete: number) => {
    if (!window.confirm("คุณต้องการลบโรงแรมนี้ใช่หรือไม่?")) return;
    try {
      const updatedHotels = (hotels || []).filter((_, i) => i !== indexToDelete);
      const updatedTripData = {
        ...tripData,
        hotels: updatedHotels,
      };

      await updateTripData({
        tripId: tripId as Id<"trips">,
        tripData: updatedTripData,
      });
    } catch (err) {
      console.error("Failed to delete hotel:", err);
    }
  };

  const hasHotels = hotels && hotels.length > 0;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-normal text-gray-900 dark:text-[#e3fafc]">🏨 โรงแรมแนะนำ</h2>
        {isEditable && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-pink-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
          >
            <Plus className="h-3.5 w-3.5" /> เพิ่มโรงแรม
          </motion.button>
        )}
      </div>

      {!hasHotels ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm dark:border-white/10 dark:bg-[#0a233d] dark:text-[#e3fafc]/68"
        >
          ยังไม่มีข้อมูลโรงแรมแนะนำสำหรับทริปนี้
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerSoft}
          className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {hotels.map((hotel, index) => {
            const name = hotel.name || "-";
            const rating = hotel.rating;

            return (
              <motion.article
                key={`${name}-${index}`}
                variants={cardVariant}
                whileHover={shouldReduceMotion ? {} : { ...liftHover, boxShadow: "0 20px 50px rgba(15,58,100,0.12)" }}
                className="card-glow smooth-card relative rounded-2xl bg-white shadow-sm dark:bg-[#0a233d] dark:shadow-none"
              >
                {isEditable && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteHotel(index)}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-red-500"
                    aria-label="ลบโรงแรม"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                )}

                <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-pink-400 via-cyan-400 to-lime-300 text-6xl font-black text-white gradient-animated">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {getInitial(name)}
                  </motion.span>
                </div>

                <div className="space-y-3 p-5">
                  <div>
                    <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-[#e3fafc]">
                      {name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm">{renderStars(rating)}</span>
                      <span className="text-sm text-gray-500 dark:text-[#e3fafc]/68">
                        {rating ? rating.toFixed(1) : "-"}
                      </span>
                    </div>
                  </div>

                  <p className="line-clamp-1 text-sm text-gray-500 dark:text-[#e3fafc]/68">
                    📍 {hotel.address || "-"}
                  </p>

                  <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">
                    💰 {hotel.price || "-"}
                  </span>

                  <p className="line-clamp-2 text-sm leading-6 text-gray-600 dark:text-[#e3fafc]/80">
                    {hotel.description || "-"}
                  </p>

                  <div className="pt-2">
                    <NavigateDropdown
                      name={name}
                      coordinates={hotel.coordinates}
                      variant="full"
                    />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}

      {/* Modal เพิ่มโรงแรม */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0a233d]"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#e3fafc]">เพิ่มโรงแรมแนะนำ 🏨</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddHotel} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    ชื่อโรงแรม
                  </label>
                  <input
                    type="text"
                    required
                    value={newHotel.name}
                    onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    ที่อยู่
                  </label>
                  <input
                    type="text"
                    required
                    value={newHotel.address}
                    onChange={(e) => setNewHotel({ ...newHotel, address: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    ราคา (เช่น 2,500 บาท / คืน)
                  </label>
                  <input
                    type="text"
                    required
                    value={newHotel.price}
                    onChange={(e) => setNewHotel({ ...newHotel, price: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    ระดับดาว (1 - 5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    required
                    value={newHotel.rating}
                    onChange={(e) => setNewHotel({ ...newHotel, rating: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    คำอธิบายโรงแรม
                  </label>
                  <textarea
                    rows={3}
                    value={newHotel.description}
                    onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-[#e3fafc] dark:hover:bg-white/5"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-pink-500 py-2.5 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-50"
                  >
                    {isSaving ? (
                      "กำลังบันทึก..."
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> บันทึก
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
