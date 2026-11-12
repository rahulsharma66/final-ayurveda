import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout"; // Lowercase 'l' for layout folder
import { ChevronLeft, Leaf } from "lucide-react";
import { getIngredientByName } from "@/lib/api"; // Importing our new specific function

interface IngredientDetailData {
  name: string;
  description: string;
  image?: string;
  images?: string[];
}

const IngredientDetail = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [ingredient, setIngredient] = useState<IngredientDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchIngredient = async () => {
      try {
        if (name) {
          const data = await getIngredientByName(name);
          setIngredient(data);
          setSelectedImage(0);
        }
      } catch (error) {
        console.error("Failed to load ingredient", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredient();
  }, [name]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground text-lg animate-pulse font-medium">
          Unearthing botanical secrets...
        </div>
      </Layout>
    );
  }

  if (!ingredient) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Ingredient Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find details for "{name}".</p>
          <button onClick={() => navigate(-1)} className="text-primary font-bold hover:underline">
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  const images =
    Array.isArray(ingredient.images) && ingredient.images.length > 0
      ? ingredient.images
      : ingredient.image
        ? [ingredient.image]
        : [];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-secondary/50 border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Product
          </button>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-10 md:py-20 bg-background min-h-[60vh] flex items-center">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-xl border border-border/50 transition-all hover:shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                {images.length > 0 ? (
                  <div className="w-full">
                    <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border/50 bg-white">
                      <img
                        src={images[selectedImage]}
                        alt={ingredient.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {images.length > 1 && (
                      <div className="mt-3 flex justify-center gap-3 overflow-x-auto pb-1 md:justify-start">
                        {images.map((img: string, index: number) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedImage(index)}
                            className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition md:h-24 md:w-24 ${
                              selectedImage === index
                                ? "border-primary"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${ingredient.name} ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square w-full rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Leaf className="w-20 h-20 text-primary" />
                  </div>
                )}
              </div>

              <div className="text-center md:text-left">
                <h1 className="font-serif text-3xl md:text-5xl font-black text-foreground mb-5 tracking-tight">
                  {ingredient.name}
                </h1>

                <div className="w-16 h-1.5 bg-primary/30 rounded-full mb-6 mx-auto md:mx-0"></div>

                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap break-words">
                  {ingredient.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default IngredientDetail;