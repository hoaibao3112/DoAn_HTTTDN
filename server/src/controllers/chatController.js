const chatController = {
    getUnreadCount: async (req, res) => {
        // Return 0 for now
        res.json({ success: true, count: 0 });
    },
    getUnreadRooms: async (req, res) => {
        // Return empty array
        res.json({ success: true, data: [] });
    }
};

export default chatController;
