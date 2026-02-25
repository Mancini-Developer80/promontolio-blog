const prisma = require("../db");
const fs = require("fs");
const path = require("path");

// 1. Funzione principale Media Library
const mediaLibrary = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || undefined;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    // Usiamo mediaFiles per evitare conflitti di nomi con l'oggetto globale media
    const [mediaFiles, totalMedia] = await Promise.all([
      prisma.media.findMany({
        where,
        include: { uploadedBy: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    // Calcolo delle statistiche raggruppate
    const stats = await prisma.media.groupBy({
      by: ["category"],
      _count: { _all: true },
      _sum: { size: true },
    });

    // Sommiamo la dimensione di ogni categoria per avere il totale generale (totalSize)
    const totalSize = stats.reduce(
      (acc, curr) => acc + (curr._sum.size || 0),
      0,
    );

    res.render("admin/mediaLibrary", {
      title: "Media Library", // Titolo per head.ejs
      media: mediaFiles, // Passiamo mediaFiles come 'media' per il template
      stats,
      totalSize, // Risolve il crash alla riga 474
      totalMedia,
      currentRoute: "/admin/media",
      pagination: {
        current: page,
        total: Math.ceil(totalMedia / limit),
      },
      filters: { category, search },
      user: req.user,
    });
  } catch (error) {
    console.error("Error loading media library:", error);
    // Passiamo sempre title e user anche in caso di errore per evitare crash dei partials
    res.status(500).render("admin/dashboard", {
      title: "Errore Media",
      error: "Errore durante il caricamento della libreria media.",
      user: req.user,
      currentRoute: "/admin/media",
    });
  }
};

// 2. Altre funzioni (Stub per mantenere le rotte funzionanti)
const uploadForm = async (req, res) => {
  res.render("admin/mediaUpload", {
    title: "Upload Media",
    user: req.user,
    currentRoute: "/admin/media",
  });
};

// Esempio di come diventerà la funzione uploadMedia nel tuo controller
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      req.flash("error", "Nessun file selezionato.");
      return res.redirect("/admin/media/upload");
    }

    const { originalname, mimetype, size, filename } = req.file;
    const baseUrl = "/uploads/media/"; // La tua cartella pubblica

    await prisma.media.create({
      data: {
        filename: filename,
        originalName: originalname,
        mimetype: mimetype,
        size: size,
        path: path.join(__dirname, "../public/uploads/media", filename),
        url: baseUrl + filename,
        category: mimetype.startsWith("image") ? "IMAGE" : "DOCUMENT",
        uploadedById: req.user.id, // Collegamento all'utente loggato
      },
    });

    req.flash("success", "File caricato correttamente!");
    res.redirect("/admin/media");
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Errore durante l'upload.");
  }
};

const getMediaDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const mediaItem = await prisma.media.findUnique({
      where: { id: parseInt(id) },
      include: {
        uploadedBy: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!mediaItem) {
      return res.status(440).json({ error: "File non trovato." });
    }

    // Rispondiamo con un JSON perché solitamente questa chiamata
    // viene fatta via AJAX/Fetch dall'interfaccia della Media Library
    res.json(mediaItem);
  } catch (error) {
    console.error("Error fetching media details:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

const mediaDetailsView = async (req, res) => {
  try {
    const { id } = req.params;

    const mediaItem = await prisma.media.findUnique({
      where: { id: parseInt(id) },
      include: {
        uploadedBy: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!mediaItem) {
      req.flash("error", "File multimediale non trovato.");
      return res.redirect("/admin/media");
    }

    res.render("admin/mediaDetails", {
      title: `Dettagli: ${mediaItem.originalName}`,
      media: mediaItem,
      user: req.user,
      currentRoute: "/admin/media",
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading media details view:", error);
    res.status(500).render("admin/dashboard", {
      title: "Errore",
      error: "Impossibile caricare i dettagli del file.",
      user: req.user,
    });
  }
};

const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, alt, description, category, tags } = req.body;

    // Gestione dei tag: se arrivano come stringa separata da virgole, li trasformiamo in Array
    let tagsArray = [];
    if (tags) {
      tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
    }

    const updatedMedia = await prisma.media.update({
      where: { id: parseInt(id) },
      data: {
        title: title || "",
        alt: alt || "",
        description: description || "",
        category: category, // Deve corrispondere agli ENUM (IMAGE, DOCUMENT, etc.)
        tags: tagsArray,
      },
    });

    req.flash("success", "Dati multimediali aggiornati correttamente!");
    res.redirect(`/admin/media/details/${id}`);
  } catch (error) {
    console.error("Error updating media details:", error);
    req.flash("error", "Errore durante l'aggiornamento dei dati.");
    res.redirect("/admin/media");
  }
};

const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Recuperiamo i dettagli del file prima di eliminarlo per conoscere il path
    const mediaItem = await prisma.media.findUnique({
      where: { id: parseInt(id) },
    });

    if (!mediaItem) {
      req.flash("error", "File non trovato.");
      return res.redirect("/admin/media");
    }

    // 2. Eliminiamo il record dal database
    await prisma.media.delete({
      where: { id: parseInt(id) },
    });

    // 3. Eliminiamo il file fisico dal server
    // Il path è memorizzato nel DB (es. C:\...\public\uploads\media\foto.jpg)
    if (fs.existsSync(mediaItem.path)) {
      fs.unlinkSync(mediaItem.path);
    } else {
      console.warn(`File fisico non trovato al percorso: ${mediaItem.path}`);
    }

    req.flash("success", "File eliminato definitivamente dal sistema.");
    res.redirect("/admin/media");
  } catch (error) {
    console.error("Error during media deletion:", error);
    req.flash("error", "Errore critico durante l'eliminazione del file.");
    res.redirect("/admin/media");
  }
};

const bulkOperation = async (req, res) => {
  try {
    const { ids, action } = req.body; // ids sarà un array di ID [1, 2, 5...]

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      req.flash("error", "Nessun elemento selezionato.");
      return res.redirect("/admin/media");
    }

    if (action === "delete") {
      // 1. Recuperiamo i percorsi dei file fisici prima di eliminarli dal DB
      const items = await prisma.media.findMany({
        where: { id: { in: ids.map((id) => parseInt(id)) } },
        select: { path: true },
      });

      // 2. Eliminiamo i record dal database
      await prisma.media.deleteMany({
        where: { id: { in: ids.map((id) => parseInt(id)) } },
      });

      // 3. Pulizia del filesystem
      items.forEach((item) => {
        if (fs.existsSync(item.path)) {
          fs.unlinkSync(item.path);
        }
      });

      req.flash("success", `${items.length} file eliminati con successo.`);
    }

    res.redirect("/admin/media");
  } catch (error) {
    console.error("Bulk operation error:", error);
    req.flash("error", "Errore durante l'operazione di massa.");
    res.redirect("/admin/media");
  }
};

const getMediaForEditor = async (req, res) => {
  try {
    // Spesso gli editor caricano solo le immagini
    const media = await prisma.media.findMany({
      where: {
        category: "IMAGE", // Filtriamo per mostrare solo immagini nell'editor
      },
      select: {
        id: true,
        url: true,
        title: true,
        alt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Formato standard per molti plugin di image picker
    res.json(media);
  } catch (error) {
    console.error("Editor media fetch error:", error);
    res
      .status(500)
      .json({ error: "Impossibile caricare i media per l'editor." });
  }
};

// 3. Export dell'oggetto controller
module.exports = {
  mediaLibrary,
  uploadForm,
  uploadMedia,
  getMediaDetails,
  mediaDetailsView,
  updateMedia,
  deleteMedia,
  bulkOperation,
  getMediaForEditor,
};
