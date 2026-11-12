import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Check,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProductById, getIngredients, getProducts } from "@/lib/api";

interface IngredientInfo {
  name: string;
  description?: string;
  image?: string;
  images?: string[];
}

interface ProductDetailData {
  _id?: string;
  id?: string;
  name: string;
  shortName?: string;
  description?: string;
  longDescription?: string;
  category?: string;
  images?: string[];
  variants?: { size: string; salePrice: number; mrp?: number }[];
  price?: number;
  platformLinks?: { platform?: string; url?: string }[];
  meeshoLink?: string;
  benefits?: string[];
  ingredients?: string[];
  usage?: string[];
  details?: { label?: string; value?: string }[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [allProducts, setAllProducts] = useState<ProductDetailData[]>([]);
  const [ingredientInfo, setIngredientInfo] = useState<Record<string, IngredientInfo>>({});
  const [ingredientsLoaded, setIngredientsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data?.product ? data.product : data);
        setSelectedImageIndex(0);
        setSelectedVariantIndex(0);
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      const data = await getProducts();
      if (!active) return;
      setAllProducts(Array.isArray(data) ? (data as ProductDetailData[]) : []);
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!product?.ingredients?.length) {
      setIngredientInfo({});
      setIngredientsLoaded(true);
      return;
    }

    let active = true;
    setIngredientsLoaded(false);

    const loadIngredientInfo = async () => {
      try {
        const data = await getIngredients();
        if (!active) return;

        const map: Record<string, IngredientInfo> = {};
        (data || []).forEach((item: IngredientInfo) => {
          if (item?.name) map[item.name.toLowerCase()] = item;
        });
        setIngredientInfo(map);
        setIngredientsLoaded(true);
      } catch (error) {
        console.error("Failed to load ingredient details", error);
      }
    };

    loadIngredientInfo();

    return () => {
      active = false;
    };
  }, [product]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product?.images?.length) {
      setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product?.images?.length) {
      setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  const buyLinks = useMemo(() => {
    const links = (product?.platformLinks || [])
      .filter((l) => l?.url)
      .map((l) => ({ platform: l.platform || "Buy", url: l.url || "" }));
    if (links.length === 0 && product?.meeshoLink) {
      links.push({ platform: "Meesho", url: product.meeshoLink });
    }
    return links;
  }, [product]);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    const currentId = product._id || product.id || id;
    const others = allProducts.filter((p) => (p._id || p.id) !== currentId);
    const sameCategory = product.category
      ? others.filter((p) => p.category === product.category)
      : [];
    const list = sameCategory.length > 0 ? sameCategory : others;
    return list.slice(0, 4);
  }, [allProducts, product, id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground text-lg">
          Loading product details...
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products"><Button>Back to Products</Button></Link>
        </div>
      </Layout>
    );
  }

  const variants = product.variants?.length
    ? product.variants
    : [{ size: "Standard", salePrice: product.price || 0, mrp: product.price || 0 }];

  const selectedVariant = variants[selectedVariantIndex];
  const images = product.images || [];

  const discountPercent =
    selectedVariant?.mrp && selectedVariant.mrp > selectedVariant.salePrice
      ? Math.round(
          ((selectedVariant.mrp - selectedVariant.salePrice) / selectedVariant.mrp) * 100,
        )
      : 0;

  const hasLongDescription = Boolean(product.longDescription?.trim());
  const hasBenefits = Boolean(product.benefits?.length);
  const visibleDetails = (product.details || []).filter(
    (detail) => detail.label?.trim() && detail.value?.trim(),
  );
  const hasDetails = visibleDetails.length > 0;
  const visibleIngredients =
    product.ingredients && ingredientsLoaded
      ? product.ingredients.filter((name) => ingredientInfo[name.toLowerCase()])
      : product.ingredients || [];
  const hasIngredients = visibleIngredients.length > 0;
  const hasUsage = Boolean(product.usage?.length);
  const hasAccordionInfo = hasLongDescription || hasBenefits || hasIngredients || hasUsage;

  return (
    <Layout>
      <div className="bg-secondary/50 border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>

      <section className="py-8 md:py-14">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12">
            {/* --- IMAGE GALLERY --- */}
            <div>
              <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden border border-border/50 group flex items-center justify-center">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white text-foreground p-2.5 rounded-full shadow-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-primary hover:text-white text-foreground p-2.5 rounded-full shadow-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-9xl">🌿</span>
                )}

                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-accent text-accent-foreground text-xs font-bold rounded-full shadow-sm">
                    -{discountPercent}%
                  </span>
                )}

                {product.category && (
                  <span className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold rounded-full shadow-sm">
                    {product.category}
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* --- DETAILS SECTION --- */}
            <div className="flex flex-col">
              <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {product.category && (
                <p className="mt-2 text-xs uppercase tracking-wider text-primary font-semibold">
                  {product.category}
                </p>
              )}

              {product.description && (
                <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  ₹{selectedVariant?.salePrice}
                </span>
                {selectedVariant?.mrp && selectedVariant.mrp !== selectedVariant.salePrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{selectedVariant.mrp}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Inclusive of all taxes
              </p>

              {variants.length > 1 && (
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Size</span>
                    <span className="text-xs text-muted-foreground">{selectedVariant?.size}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {variants.map((variant, index: number) => (
                      <button
                        key={variant.size}
                        onClick={() => setSelectedVariantIndex(index)}
                        className={`px-5 py-2 text-sm rounded-lg border transition-all ${
                          selectedVariantIndex === index
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {variant.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {buyLinks.length > 0 ? (
                <div className="mt-6 space-y-2.5 max-w-md">
                  {buyLinks.map((link, i: number) => (
                    <Button
                      key={i}
                      className="w-full gap-2 bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-md"
                      onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
                    >
                      <ShoppingBag className="w-5 h-5" /> Buy on {link.platform}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="mt-6 max-w-md">
                  <Button
                    className="w-full gap-2 h-12 text-base font-bold shadow-md"
                    variant="outline"
                    disabled
                  >
                    <ShoppingBag className="w-5 h-5" /> Currently unavailable
                  </Button>
                </div>
              )}

              {hasDetails && (
                <div className="mt-6 rounded-2xl border border-border/50 bg-card p-4 md:p-5">
                  <h3 className="font-serif text-lg font-bold text-foreground mb-3">
                    Product Details
                  </h3>
                  <dl className="divide-y divide-border/50">
                    {visibleDetails.map((detail, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] gap-3 py-2.5 text-sm"
                      >
                        <dt className="font-semibold text-foreground">{detail.label}</dt>
                        <dd className="text-muted-foreground">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {hasAccordionInfo && (
                <Accordion
                  type="single"
                  collapsible
                  className="mt-8 rounded-2xl border border-border/50 bg-card px-4 md:px-6"
                >
                  {hasLongDescription && (
                    <AccordionItem value="description" className="border-border/50">
                      <AccordionTrigger className="font-serif text-lg font-bold hover:no-underline">
                        Description
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {product.longDescription}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                {product.benefits && product.benefits.length > 0 && (
                  <AccordionItem value="benefits" className="border-border/50">
                    <AccordionTrigger className="font-serif text-lg font-bold hover:no-underline">
                      Key Features
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2.5">
                        {product.benefits.map((benefit: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-neem mt-0.5 shrink-0" />
                            <span className="text-muted-foreground font-medium">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {visibleIngredients.length > 0 && (
                  <AccordionItem value="ingredients" className="border-border/50">
                    <AccordionTrigger className="font-serif text-lg font-bold hover:no-underline">
                      Ingredients
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {visibleIngredients.map((ingredient: string, i: number) => {
                          const info = ingredientInfo[ingredient.toLowerCase()];
                          const ingredientImages = info?.images?.length
                            ? info.images
                            : info?.image
                              ? [info.image]
                              : [];

                          return (
                            <Link
                              key={i}
                              to={`/ingredient/${ingredient}`}
                              className="group flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/30 p-3 hover:border-primary/30 hover:shadow-sm transition-all"
                            >
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-white flex items-center justify-center">
                                {ingredientImages[0] ? (
                                  <img
                                    src={ingredientImages[0]}
                                    alt={ingredient}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <Leaf className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {ingredient}
                                </p>
                                {info?.description && (
                                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                                    {info.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {product.usage && product.usage.length > 0 && (
                  <AccordionItem value="usage" className="border-border/50">
                    <AccordionTrigger className="font-serif text-lg font-bold hover:no-underline">
                      How to Use
                    </AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-3">
                        {product.usage.map((step: string, i: number) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm text-muted-foreground font-medium leading-relaxed"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black shrink-0">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                )}
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- SIMILAR PRODUCTS --- */}
      {similarProducts.length > 0 && (
        <section className="border-t border-border/50 bg-secondary/30 py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6">
              Similar Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((item) => {
                const productId = item._id || item.id;
                const variant = item.variants?.[0];
                const price = variant?.salePrice ?? item.price ?? 0;
                const mrp = variant?.mrp;

                return (
                  <Link
                    key={productId}
                    to={`/products/${productId}`}
                    className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-white overflow-hidden flex items-center justify-center">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Leaf className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-serif text-sm md:text-base font-bold text-foreground line-clamp-2">
                        {item.shortName || item.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-bold text-primary">₹{price}</span>
                        {mrp && mrp !== price && (
                          <span className="text-xs text-muted-foreground line-through">₹{mrp}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetail;
