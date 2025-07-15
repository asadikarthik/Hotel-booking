import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js"; // Assuming Room model is needed for Room.create

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;
        const hotel = await Hotel.findOne({ owner: req.auth.userId });

        if (!hotel) return res.json({ success: false, message: "No Hotel found" });

        // upload images to cloudinary
        const uploadImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        });

        // Wait for all uploads to complete
        const images = await Promise.all(uploadImages);

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight, // Ensure pricePerNight is a number
            amenities: JSON.parse(amenities),
            images,
        });

        res.json({ success: true, message: "Room created successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to get all rooms
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isAvailable: true }).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image'
            }
        }).sort({ createdAt: -1 })
        res.json({ success: true, rooms })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// API to get all rooms for a specific hotel
export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({ owner: req.auth.userId }); // Added .findOne()
        const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate(
            "hotel"
        );
        res.json({ success: true, rooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to toggle availability of a room
export const toggleRoomAvailability = async (req, res)=>{
    try {
        const { roomId } = req.body;
        const roomData = await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({ success: true, message: "Room availability Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}



// API to update a room
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomType, pricePerNight, amenities } = req.body;

        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotel) {
            return res.json({ success: false, message: "Hotel not found" });
        }

        const room = await Room.findById(id);
        if (!room) {
            return res.json({ success: false, message: "Room not found" });
        }

        if (room.hotel.toString() !== hotel._id.toString()) {
            return res.json({ success: false, message: "Not authorized to edit this room" });
        }

        room.roomType = roomType || room.roomType;
        room.pricePerNight = pricePerNight || room.pricePerNight;
        room.amenities = amenities || room.amenities;

        await room.save();

        res.json({ success: true, message: "Room updated successfully", room });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to delete a room
export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotel) {
            return res.json({ success: false, message: "Hotel not found" });
        }

        const room = await Room.findById(id);
        if (!room) {
            return res.json({ success: false, message: "Room not found" });
        }

        if (room.hotel.toString() !== hotel._id.toString()) {
            return res.json({ success: false, message: "Not authorized to delete this room" });
        }

        await room.deleteOne();

        res.json({ success: true, message: "Room deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
