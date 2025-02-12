import { PrismaClient } from "@prisma/client";
import express from "express";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// 📌 Create a resource
app.post("/resources", async (req, res) => {
  try {
    const { name, description } = req.body;
    const resource = await prisma.resource.create({
      data: { name, description },
    });
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: "Failed to create resource" });
  }
});

// 📌 List resources with filters
app.get("/resources", async (req, res) => {
  try {
    const { name, page = "1", limit = "10" } = req.query;
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * pageSize;

    const resources = await prisma.resource.findMany({
      where: name ? { name: { contains: String(name) } } : {},
      skip,
      take: pageSize,
    });
    const totalCount = await prisma.resource.count({
      where: name
        ? { name: { contains: String(name) } }
        : {},
    });
    res.json({ data: resources, total: totalCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// 📌 Get details of a resource
app.get("/resources/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id: Number(id) },
    });
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resource" });
  }
});

// 📌 Update resource details
app.put("/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedResource = await prisma.resource.update({
      where: { id: Number(id) },
      data: { name, description },
    });
    res.json(updatedResource);
  } catch (error) {
    res.status(500).json({ error: "Failed to update resource" });
  }
});

// 📌 Delete a resource
app.delete("/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.resource.delete({ where: { id: Number(id) } });
    res.json({ message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
