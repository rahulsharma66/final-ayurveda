import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { getProducts } from "@/lib/api";

interface FooterProduct {
  _id?: string;
  id?: string;
  name: string;
  shortName?: string;
  featured?: boolean;
}

export const Footer = () => {
  const [products, setProducts] = useState<FooterProduct[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const data = await getProducts();
        if (!mounted) return;

        const list = Array.isArray(data) ? (data as FooterProduct[]) : [];
        setProducts(list.filter((product) => product.featured).slice(0, 5));
      } catch {
        if (mounted) setProducts([]);
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-semibold">Dinkar</span>
                <span className="text-xs opacity-80 -mt-1 tracking-wider">AYURVEDA</span>
              </div>
            </Link>
            <p className="text-sm opacity-80 leading-relaxed">
              Pure Ayurvedic wellness backed by tradition. Crafted with love using ancient 
              Vedic formulations for modern health needs.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
                { name: "Products", path: "/products" },
                { name: "Ayurveda", path: "/ayurveda" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Our Products</h4>
            {products.length > 0 ? (
              <ul className="space-y-2">
                {products.map((product) => {
                  const productId = product._id || product.id;
                  return (
                    <li key={productId || product.name}>
                      <Link
                        to={productId ? `/products/${productId}` : "/products"}
                        className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                      >
                        {product.shortName || product.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Link
                to="/products"
                className="text-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                View All Products
              </Link>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+918302464069"
                  className="flex items-start gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Phone className="w-4 h-4 mt-0.5" />
                  <span>+91 83024 64069</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:dinkarayurveda@gmail.com"
                  className="flex items-start gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Mail className="w-4 h-4 mt-0.5" />
                  <span>dinkarayurveda@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 opacity-80" />
                <span className="text-sm opacity-80">
                  Ayurvedic Wellness Center,<br />
                  Gujarat, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-70">
              © {new Date().getFullYear()} Dinkar Ayurveda. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                Terms of Service
              </Link>
              <Link to="/shipping" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
