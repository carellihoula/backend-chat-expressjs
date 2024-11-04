const cron = require("node-cron");
const Message = require("./models/MessageModel");

//Cron job to delete messages older than 24 hours every hour
cron.schedule("0 * * * *", async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // Date and time 24 hours ago

  try {
    const result = await Message.deleteMany({ createdAt: { $lt: cutoff } });
    console.log(`Deleted messages : ${result.deletedCount}`);
  } catch (error) {
    console.error("Error deleting messages :", error);
  }
});

console.log("The cron job for deleting messages has been configured.");
