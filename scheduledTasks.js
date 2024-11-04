const cron = require("node-cron");
const Message = require("./models/MessageModel");

//Cron job to delete messages older than 24 hours every hour
cron.schedule("0 * * * *", async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // Date and time 24 hours ago

  try {
    const result = await Message.deleteMany({ createdAt: { $lt: cutoff } });
    console.log(`Messages supprimés : ${result.deletedCount}`);
  } catch (error) {
    console.error("Erreur lors de la suppression des messages :", error);
  }
});

console.log("La tâche cron pour supprimer les messages a été configurée.");
