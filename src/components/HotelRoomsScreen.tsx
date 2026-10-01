import React, { useState, useRef, useEffect } from 'react';
import { RoomModel, MenuItem, RoomOrderItem, HotelCheckoutSummary } from '../types/pos';
import {
  BedDouble,
  Plus,
  Phone,
  Calendar,
  User,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  Tag,
  X,
  Utensils,
  Receipt,
  ShoppingBag,
  Sparkles,
  Search,
  Camera,
  FileImage,
  Eye,
  Trash2,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Check,
  Printer,
} from 'lucide-react';
import { HotelRoomCheckoutModal } from './HotelRoomCheckoutModal';

interface Props {
  rooms: RoomModel[];
  menuItems: MenuItem[];
  onAddRoom: (room: RoomModel) => void;
  onUpdateRoom: (room: RoomModel) => void;
  onCheckOutRoom: (roomId: string, summary?: HotelCheckoutSummary) => void;
}

export const HotelRoomsScreen: React.FC<Props> = ({ rooms, menuItems, onAddRoom, onUpdateRoom, onCheckOutRoom }) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomModel | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [roomOrderModalRoom, setRoomOrderModalRoom] = useState<RoomModel | null>(null);
  const [checkoutReceiptRoom, setCheckoutReceiptRoom] = useState<RoomModel | null>(null);
  const [previewIdPhoto, setPreviewIdPhoto] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Room menu POS ordering filter states
  const [roomMenuCategory, setRoomMenuCategory] = useState<string>('All');
  const [roomMenuSearch, setRoomMenuSearch] = useState<string>('');

  const roomCategories = [
    'All',
    'Mo:Mo',
    'Noodles',
    'Khaja & Snacks',
    'Light Snacks',
    'Nepali Khana',
    'Rice & Biryani',
    'Hard Drinks & Beer',
    'Cigarettes',
    'Beverages',
  ];

  const filteredRoomMenuItems = menuItems.filter((item) => {
    const matchesCategory = roomMenuCategory === 'All' || item.category === roomMenuCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(roomMenuSearch.toLowerCase()) ||
      item.description?.toLowerCase().includes(roomMenuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Booking form state
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [nights, setNights] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState('');

  // ID Card photo and verification state
  const [idCardType, setIdCardType] = useState('नागरिकता (Citizenship)');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardPhotoUrl, setIdCardPhotoUrl] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Live in-app video stream binding
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    if (isCameraActive) {
      (async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError('यो ब्राउजरमा सिधै भिडियो क्यामेरा सपोर्ट छैन। कृपया तलको "मोबाइल क्यामेरा" बटन प्रयोग गर्नुहोस्।');
            setIsCameraActive(false);
            return;
          }
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
          });
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(() => {});
            };
          }
        } catch (err: any) {
          console.warn('Camera access not granted or unavailable:', err?.message || err);
          setCameraError('क्यामेरा अनुमति पाइएन वा उपलब्ध छैन। कृपया तलको "मोबाइल क्यामेरा वा ग्यालरी" बटनबाट फोटो खिच्नुहोस् वा छान्नुहोस्।');
          setIsCameraActive(false);
        }
      })();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  const startCamera = () => {
    setCameraError(null);
    setIsCameraActive(true);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setIdCardPhotoUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardPhotoUrl(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Add room form state
  const [newRoomNum, setNewRoomNum] = useState('');
  const [newRoomType, setNewRoomType] = useState<'Standard' | 'Deluxe' | 'Suite' | 'Family Villa'>('Deluxe');
  const [newPrice, setNewPrice] = useState(3500);
  const [newImg, setNewImg] = useState('');

  const handleOpenBooking = (room: RoomModel) => {
    setSelectedRoom(room);
    setGuestName(room.guestName || '');
    setPhone(room.phone || '');
    setNights(room.nights || 1);
    setDiscountPercent(room.discountPercent || 0);
    setNotes(room.notes || '');
    setIdCardType(room.idCardType || 'नागरिकता (Citizenship)');
    setIdCardNumber(room.idCardNumber || '');
    setIdCardPhotoUrl(room.idCardPhotoUrl || '');
    stopCamera();
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    stopCamera();
    setIsBookingModalOpen(false);
  };

  const handleBookRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !guestName.trim()) return;

    const updated: RoomModel = {
      ...selectedRoom,
      status: 'occupied',
      guestName,
      phone,
      idCardType,
      idCardNumber,
      idCardPhotoUrl,
      nights: Number(nights),
      checkInDate: new Date().toLocaleDateString(),
      discountPercent: Number(discountPercent),
      notes,
      orderedItems: selectedRoom.orderedItems || [],
    };
    onUpdateRoom(updated);
    stopCamera();
    setIsBookingModalOpen(false);
    showToast(`रूम #${selectedRoom.roomNumber} (${guestName}) को नाममा बुक भयो! परिचयपत्र विवरण सुरक्षित गरियो।`);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNum.trim()) return;
    const room: RoomModel = {
      id: `room-${Date.now()}`,
      roomNumber: newRoomNum,
      roomType: newRoomType,
      pricePerNight: Number(newPrice),
      status: 'available',
      imageUrl: newImg.trim() || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80',
      orderedItems: [],
    };
    onAddRoom(room);
    setNewRoomNum('');
    setIsAddRoomModalOpen(false);
    showToast(`नयाँ रुम #${newRoomNum} सफलतापूर्वक थपियो!`);
  };

  const handleAddMenuItemToRoom = (room: RoomModel, menuItem: MenuItem) => {
    const existing = room.orderedItems?.find((i) => i.id === menuItem.id);
    let updatedOrderedItems: RoomOrderItem[];
    if (existing) {
      updatedOrderedItems = room.orderedItems!.map((i) =>
        i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updatedOrderedItems = [
        ...(room.orderedItems || []),
        { id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 },
      ];
    }
    const updatedRoom = { ...room, orderedItems: updatedOrderedItems };
    onUpdateRoom(updatedRoom);
    setRoomOrderModalRoom(updatedRoom);
  };

  const handleRemoveMenuItemFromRoom = (room: RoomModel, itemId: string) => {
    const updatedOrderedItems = (room.orderedItems || [])
      .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    const updatedRoom = { ...room, orderedItems: updatedOrderedItems };
    onUpdateRoom(updatedRoom);
    setRoomOrderModalRoom(updatedRoom);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Hotel Management & Room Service
            </span>
            <span className="text-xs text-slate-400">
              Total Rooms: {rooms.length} | Occupied: {rooms.filter((r) => r.status === 'occupied').length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <BedDouble className="w-7 h-7 text-amber-400" />
            <span>होटल रुम तथा रुम सर्भिस व्यवस्थापन (Rooms & Room Service)</span>
          </h1>
        </div>

        <button
          onClick={() => setIsAddRoomModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>नयाँ रुम थप्नुहोस् (Add Room)</span>
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
        {rooms.map((room) => {
          const isOccupied = room.status === 'occupied';
          const nightsCount = room.nights || 1;
          const netRoomRent = room.pricePerNight * nightsCount * (1 - (room.discountPercent || 0) / 100);
          const foodOrdersTotal = (room.orderedItems || []).reduce((s, i) => s + i.price * i.quantity, 0);
          const totalCombinedBill = netRoomRent + foodOrdersTotal;

          return (
            <div
              key={room.id}
              className={`rounded-3xl bg-slate-900 border-2 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl ${
                isOccupied
                  ? 'border-rose-500/50 shadow-rose-950/30'
                  : 'border-emerald-500/50 shadow-emerald-950/30'
              }`}
            >
              {/* Room Image Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <img
                  src={room.imageUrl}
                  alt={`Room #${room.roomNumber}`}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${
                      isOccupied
                        ? 'bg-rose-500/90 text-white'
                        : 'bg-emerald-500/90 text-slate-950'
                    }`}
                  >
                    {isOccupied ? 'Occupied (बस्नुभएको)' : 'Available (खाली)'}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-950/70 backdrop-blur-md text-amber-400 border border-amber-500/30">
                  {room.roomType}
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <span className="text-lg font-black tracking-wide">Room #{room.roomNumber}</span>
                  <span className="text-sm font-black text-amber-400">NPR {room.pricePerNight}/night</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {isOccupied ? (
                  <div className="space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>पाहुना (Guest):</span>
                      </span>
                      <span className="font-bold text-white">{room.guestName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>फोन (Phone):</span>
                      </span>
                      <span className="font-mono">{room.phone}</span>
                    </div>

                    {/* Customer ID Card Photo & Detail Badge */}
                    <div className="pt-1.5 pb-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                        <span>परिचयपत्र (ID):</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {room.idCardPhotoUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewIdPhoto(room.idCardPhotoUrl || null)}
                            className="group relative flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 text-[10px] font-bold transition-all cursor-pointer"
                            title="Click to view Customer ID Photo"
                          >
                            <img
                              src={room.idCardPhotoUrl}
                              alt="ID Thumbnail"
                              className="w-4 h-4 rounded object-cover border border-blue-400/50"
                            />
                            <span>फोटो हेर्नुहोस्</span>
                            <Eye className="w-3 h-3 text-blue-400" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">फोटो उपलब्ध छैन</span>
                        )}
                        {room.idCardNumber && (
                          <span className="font-mono text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                            #{room.idCardNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">रुम भाडा ({room.nights || 1} nights):</span>
                      <span className="font-bold text-amber-400">NPR {netRoomRent.toFixed(0)}</span>
                    </div>

                    {/* Ordered Food Summary */}
                    {room.orderedItems && room.orderedItems.length > 0 ? (
                      <div className="pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold mb-1">
                          <span>🍽️ रुम सर्भिस खाना ({room.orderedItems.reduce((s, i) => s + i.quantity, 0)} items):</span>
                          <span>NPR {foodOrdersTotal}</span>
                        </div>
                        <div className="max-h-20 overflow-y-auto space-y-0.5 text-[10px] text-slate-400">
                          {room.orderedItems.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="font-mono">Rs.{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
                        कुनै खाना अर्डर गरिएको छैन।
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-black text-sm">
                      <span>कुल जोडेर बिल (Total):</span>
                      <span className="text-amber-400 text-base">NPR {totalCombinedBill.toFixed(0)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    यो रुम हाल खाली छ। बुकिङ गर्न तलको बटन क्लिक गर्नुहोस्।
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  {isOccupied ? (
                    <>
                      {/* Main Checkout & Billing Action */}
                      <button
                        type="button"
                        onClick={() => setCheckoutReceiptRoom(room)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Receipt className="w-4 h-4 stroke-[2.5]" />
                        <span>चेकआउट र बिलिङ (Checkout & Bill)</span>
                        <Printer className="w-3.5 h-3.5 ml-1 text-slate-950/70" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRoomOrderModalRoom(room)}
                          className="flex-1 py-2 rounded-xl bg-orange-500/20 border border-orange-500/40 hover:bg-orange-500/30 text-orange-300 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                          <span>खाना अर्डर (Dining)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenBooking(room)}
                          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          अतिथि / ID
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenBooking(room)}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BedDouble className="w-4 h-4" />
                      <span>रुम बुकिङ गर्नुहोस् (Book Room)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Service / Food Ordering Modal */}
      {roomOrderModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[880px]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 p-4 sm:p-5 flex items-center justify-between text-slate-950 shadow-md">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 text-xs font-black uppercase mb-1">
                  <span>Room Service • Room #{roomOrderModalRoom.roomNumber} ({roomOrderModalRoom.guestName})</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <Utensils className="w-6 h-6 stroke-[2.5]" />
                  <span>POS Fast Food & Beverage Ordering</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRoomOrderModalRoom(null)}
                className="p-2 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={roomMenuSearch}
                  onChange={(e) => setRoomMenuSearch(e.target.value)}
                  placeholder="मेनुमा परिकार खोज्नुहोस् (Search Momo, Chowmein, Beer...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {roomCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setRoomMenuCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      roomMenuCategory === cat
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-slate-950">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoomMenuItems.map((item) => {
                  const existingInRoom = roomOrderModalRoom.orderedItems?.find((i) => i.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-lg"
                    >
                      {/* Image Banner */}
                      <div className="relative h-32 w-full overflow-hidden bg-slate-950">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30"></div>

                        {/* Category badge */}
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black/70 backdrop-blur-md text-amber-400 border border-white/10">
                          {item.category}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-black text-sm text-white group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.description || 'Freshly prepared authentic recipe.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <span className="text-base font-black text-amber-400 font-mono">
                            NPR {item.price}
                          </span>

                          <div>
                            {existingInRoom ? (
                              <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-700">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMenuItemFromRoom(roomOrderModalRoom, item.id)}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                                  title="Reduce quantity"
                                >
                                  -
                                </button>
                                <span className="text-white font-black text-xs px-2">
                                  {existingInRoom.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddMenuItemToRoom(roomOrderModalRoom, item)}
                                  className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddMenuItemToRoom(roomOrderModalRoom, item)}
                                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span>अर्डरमा जोड्नुहोस्</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Summary */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">रुममा जोडिएको कुल खाना तथा पेय पदार्थ:</span>
                <span className="text-sm font-black text-amber-400">
                  {(roomOrderModalRoom.orderedItems || []).reduce((s, i) => s + i.quantity, 0)} items • NPR{' '}
                  {(roomOrderModalRoom.orderedItems || []).reduce((s, i) => s + i.price * i.quantity, 0).toFixed(0)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRoomOrderModalRoom(null)}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
              >
                सम्पन्न गरी बन्द गर्नुहोस् (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Room Check-Out, Billing & Printable Bill Modal */}
      {checkoutReceiptRoom && (
        <HotelRoomCheckoutModal
          room={checkoutReceiptRoom}
          onClose={() => setCheckoutReceiptRoom(null)}
          onConfirmCheckout={(summary) => {
            onCheckOutRoom(checkoutReceiptRoom.id, summary);
          }}
        />
      )}

      {/* Booking Modal with Live Camera Customer ID Photo Capture */}
      {isBookingModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5" />
                <h3 className="text-base font-black">रुम बुकिङ तथा ग्राहक विवरण • Room #{selectedRoom.roomNumber}</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseBookingModal}
                className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookRoom} className="p-4 sm:p-6 space-y-4 text-sm overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  पाहुनाको पूरा नाम (Guest Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="उदा: राम कुमार श्रेष्ठ / John Smith"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  फोन नम्बर (Contact Phone) *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="उदा: 9841000000"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
              </div>

              {/* ID Card / Customer Identity Section */}
              <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      ग्राहकको परिचयपत्र (Customer ID Card Photo)
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    होटल सुरक्षा नियम
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">परिचयपत्र प्रकार (ID Type)</label>
                    <select
                      value={idCardType}
                      onChange={(e) => setIdCardType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="नागरिकता (Citizenship)">नागरिकता (Citizenship)</option>
                      <option value="राष्ट्रिय परिचयपत्र (National ID Card)">राष्ट्रिय परिचयपत्र (National ID)</option>
                      <option value="राहदानी (Passport)">राहदानी (Passport)</option>
                      <option value="सवारी चालक अनुमतिपत्र (Driving License)">सवारी चालक अनुमतिपत्र (License)</option>
                      <option value="अन्य परिचयपत्र (Other ID Card)">अन्य परिचयपत्र (Other ID)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">परिचयपत्र नम्बर (ID Number)</label>
                    <input
                      type="text"
                      value={idCardNumber}
                      onChange={(e) => setIdCardNumber(e.target.value)}
                      placeholder="उदा: 27-01-78-12345"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Hidden Native Camera Input (Opens Device Camera Directly) */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Hidden File/Gallery Input (Opens Photo Gallery / File Browser) */}
                <input
                  type="file"
                  accept="image/*"
                  ref={galleryInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Camera Viewfinder (when active) */}
                {isCameraActive ? (
                  <div className="space-y-2 bg-slate-900 p-2.5 rounded-xl border border-amber-500/50">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Guide Box Overlay */}
                      <div className="absolute inset-4 border-2 border-dashed border-amber-400/70 rounded-xl pointer-events-none flex items-center justify-center">
                        <span className="text-[10px] text-amber-200 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                          परिचयपत्रलाई यहाँ भित्र राख्नुहोस्
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 stroke-[2.5]" />
                        <span>फोटो क्याप्चर गर्नुहोस् (Capture)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="यदि कालो आएमा डिभाइस क्यामेरा खोल्नुहोस्"
                      >
                        <Camera className="w-4 h-4" />
                        <span>मोबाइल क्यामेरा</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        बन्द गर्नुहोस्
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Error message if camera fails */}
                    {cameraError && (
                      <div className="flex items-center gap-2 p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{cameraError}</span>
                      </div>
                    )}

                    {/* ID Photo Status / Preview */}
                    {idCardPhotoUrl ? (
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={idCardPhotoUrl}
                            alt="Captured ID"
                            className="w-14 h-11 object-cover rounded-lg border border-emerald-500/50 shadow cursor-pointer hover:opacity-90"
                            onClick={() => setPreviewIdPhoto(idCardPhotoUrl)}
                          />
                          <div>
                            <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>परिचयपत्र फोटो संलग्न भयो</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {idCardType} फोटो सुरक्षित छ
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewIdPhoto(idCardPhotoUrl)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs transition-colors cursor-pointer"
                            title="ठूलो हेर्नुहोस् (View Full)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs transition-colors cursor-pointer"
                            title="पुनः खिच्नुहोस् (Retake with Camera)"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIdCardPhotoUrl('')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs transition-colors cursor-pointer"
                            title="हटाउनुहोस् (Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* 1. Direct High-Quality Native Device Camera button */}
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                          >
                            <Camera className="w-4 h-4 stroke-[3]" />
                            <span>क्यामेराबाट फोटो खिच्नुहोस्</span>
                          </button>

                          {/* 2. Choose from Gallery / Files */}
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                          >
                            <FileImage className="w-4 h-4 text-amber-400" />
                            <span>ग्यालरी वा फाइलबाट छान्नुहोस्</span>
                          </button>
                        </div>

                        {/* 3. In-App Web Viewfinder toggle for desktop webcams */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors underline cursor-pointer"
                          >
                            <span>कम्प्युटर/ल्यापटप वेबक्याम प्रयोग गर्ने? (Live Viewfinder)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Nights and Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">बस्ने रात (Nights)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">विशेष छुट (Discount %)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              {/* Summary Price Box */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between font-bold">
                <span className="text-slate-400">दर: NPR {selectedRoom.pricePerNight}/रात</span>
                <span className="text-amber-400 text-sm font-black">
                  जम्मा रुम भाडा: NPR {(selectedRoom.pricePerNight * nights * (1 - discountPercent / 100)).toFixed(0)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>बुकिङ कन्फर्म गर्नुहोस् (Confirm Booking)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen Photo Zoom Modal */}
      {previewIdPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span className="font-black text-sm">ग्राहकको परिचयपत्र फोटो (Customer ID Card Preview)</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewIdPhoto(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black max-h-[75vh] overflow-auto">
              <img
                src={previewIdPhoto}
                alt="Full ID Preview"
                className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl"
              />
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setPreviewIdPhoto(null)}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                बन्द गर्नुहोस् (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 flex items-center justify-between text-white">
              <h3 className="text-base font-black">नयाँ रुम थप्नुहोस् (Add Hotel Room)</h3>
              <button type="button" onClick={() => setIsAddRoomModalOpen(false)} className="p-1 rounded-lg bg-black/20 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">रुम नम्बर (Room Number)</label>
                <input
                  type="text"
                  required
                  value={newRoomNum}
                  onChange={(e) => setNewRoomNum(e.target.value)}
                  placeholder="उदाहरण: 105"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">रुमको प्रकार (Room Type)</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Standard">Standard Room</option>
                  <option value="Deluxe">Deluxe Room</option>
                  <option value="Suite">Executive Suite</option>
                  <option value="Family Villa">Family Villa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">प्रति रात मूल्य (NPR)</label>
                <input
                  type="number"
                  required
                  min={500}
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">रुम फोटो URL (Image URL)</label>
                <input
                  type="text"
                  value={newImg}
                  onChange={(e) => setNewImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl shadow-lg transition-all cursor-pointer"
              >
                रुम सेभ गर्नुहोस् (Save Room)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* In-app Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-md bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-5 border-2 border-emerald-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
