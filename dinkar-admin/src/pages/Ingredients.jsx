import { useEffect, useRef, useState } from "react";
import api, { getIngredients } from "../services/api";
import { uploadImagesToCloudinary } from "../services/cloudinary";
import Toast from "../components/Toast";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const inputClasses =
  "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500";

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState({});
  const fileInputRef = useRef(null);

  const fetchIngredients = async () => {
    try {
      const data = await getIngredients();
      setIngredients(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: "Failed to load ingredients", type: "error" });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    const objectUrls = newImages.map((file) => URL.createObjectURL(file));
    setNewPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [newImages]);

  const imagePreviews = [
    ...existingImages.map((src, index) => ({ src, type: "existing", index })),
    ...newPreviews.map((src, index) => ({ src, type: "new", index })),
  ];

  const filteredIngredients = ingredients.filter((ingredient) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      (ingredient.name || "").toLowerCase().includes(query) ||
      (ingredient.description || "").toLowerCase().includes(query)
    );
  });

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setExistingImages([]);
    setNewImages([]);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (files.length === 0) return;

    if (files.some((file) => !ACCEPTED_TYPES.includes(file.type))) {
      setToast({
        message: "Please select only JPG, JPEG, PNG, or WEBP images.",
        type: "error",
      });
      return;
    }

    if (files.some((file) => file.size > MAX_FILE_SIZE)) {
      setToast({
        message: "Each image must be smaller than 5MB.",
        type: "error",
      });
      return;
    }

    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (type, index) => {
    if (type === "existing") {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim()) {
      setToast({
        message: "Ingredient name and description are required.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      let uploadedImages = [];

      if (newImages.length > 0) {
        uploadedImages = await uploadImagesToCloudinary(newImages);
        if (
          uploadedImages.length !== newImages.length ||
          uploadedImages.some((url) => !url)
        ) {
          throw new Error("Image upload failed");
        }
      }

      const finalImages = [...existingImages, ...uploadedImages];

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        images: finalImages,
        image: finalImages[0] || "",
      };

      if (editingId) {
        await api.put(`/api/ingredients/${editingId}`, payload);
      } else {
        await api.post("/api/ingredients", payload);
      }

      setToast({
        message: editingId
          ? "Ingredient updated successfully"
          : "Ingredient added successfully",
        type: "success",
      });
      resetForm();
      fetchIngredients();
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to save ingredient",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ingredient) => {
    const images =
      Array.isArray(ingredient.images) && ingredient.images.length > 0
        ? ingredient.images
        : ingredient.image
          ? [ingredient.image]
          : [];

    setEditingId(ingredient._id);
    setForm({
      name: ingredient.name || "",
      description: ingredient.description || "",
    });
    setExistingImages(images);
    setNewImages([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return;

    try {
      await api.delete(`/api/ingredients/${id}`);
      setIngredients((prev) => prev.filter((ing) => ing._id !== id));
      if (editingId === id) resetForm();
      setToast({ message: "Ingredient deleted", type: "success" });
    } catch {
      setToast({ message: "Failed to delete ingredient", type: "error" });
    }
  };

  if (fetching) return <div className="p-8">Loading ingredients...</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Ingredients</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add New Form */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 lg:col-span-1 h-fit">
          <h2 className="font-bold mb-4">
            {editingId ? "Edit Ingredient" : "Add New Ingredient"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredient Images
              </label>

              {imagePreviews.length === 0 ? (
                <label
                  htmlFor="ingredient-image-input"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-green-400 rounded-md cursor-pointer bg-green-50 hover:bg-green-100 transition"
                >
                  <span className="text-green-700 font-medium">
                    Click to upload images
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center px-2">
                    JPG, JPEG, PNG, WEBP (max 5MB each)
                  </span>
                </label>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviews.map((image) => (
                    <div
                      key={`${image.type}-${image.index}`}
                      className="relative"
                    >
                      <img
                        src={image.src}
                        alt="Ingredient preview"
                        className="w-full aspect-square object-cover rounded-md border bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage(image.type, image.index)
                        }
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-700"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <label
                    htmlFor="ingredient-image-input"
                    className="flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed border-green-400 bg-green-50 p-2 text-center cursor-pointer hover:bg-green-100 transition"
                  >
                    <span className="text-sm font-medium text-green-700">
                      + Add image
                    </span>
                    <span className="text-[10px] text-gray-500">
                      JPG, PNG, WEBP
                    </span>
                  </label>
                </div>
              )}

              <input
                id="ingredient-image-input"
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <div>
              <label
                htmlFor="ingredient-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ingredient Name
              </label>
              <input
                id="ingredient-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ingredient Name (e.g. Ashwagandha)"
                required
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="ingredient-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description / Benefits
              </label>
              <textarea
                id="ingredient-description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Full Description / Benefits..."
                required
                rows={6}
                className={inputClasses}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Ingredient"
                  : "Add Ingredient"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition"
              >
                Cancel Editing
              </button>
            )}
          </form>
        </div>

        {/* List of Ingredients */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-bold">Saved Ingredients</h2>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ingredients..."
              className="w-full sm:max-w-xs px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {ingredients.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">
              No ingredients found. Create one above!
            </p>
          ) : filteredIngredients.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">
              No ingredients match "{searchQuery}".
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredIngredients.map((ingredient) => {
                const images =
                  Array.isArray(ingredient.images) &&
                  ingredient.images.length > 0
                    ? ingredient.images
                    : ingredient.image
                      ? [ingredient.image]
                      : [];

                return (
                  <div
                    key={ingredient._id}
                    className="border rounded-lg bg-gray-50 overflow-hidden flex flex-col"
                  >
                    <div className="relative">
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={ingredient.name}
                          className="w-full h-40 object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                          No image
                        </div>
                      )}
                      {images.length > 1 && (
                        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {images.length} photos
                        </span>
                      )}
                    </div>

                    {images.length > 1 && (
                      <div className="flex gap-1 px-2 pt-2">
                        {images.slice(1, 4).map((src, index) => (
                          <img
                            key={index}
                            src={src}
                            alt={`${ingredient.name} ${index + 2}`}
                            className="h-10 w-10 rounded border object-cover bg-gray-100"
                          />
                        ))}
                        {images.length > 4 && (
                          <span className="flex h-10 w-10 items-center justify-center rounded border bg-gray-100 text-xs text-gray-600">
                            +{images.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-green-800 break-words">
                        {ingredient.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words line-clamp-4 flex-1">
                        {ingredient.description}
                      </p>
                      <div className="mt-4 flex justify-end gap-4 text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleEdit(ingredient)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ingredient._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Toast {...toast} onClose={() => setToast({})} />
    </div>
  );
};

export default Ingredients;
