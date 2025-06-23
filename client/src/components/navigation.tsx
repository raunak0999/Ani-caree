import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">🐾 AniCare</h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('profile')}
                  className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  Pet Profile
                </button>
                <button 
                  onClick={() => scrollToSection('care-tips')}
                  className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  Care Tips
                </button>
                <button 
                  onClick={() => scrollToSection('products')}
                  className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  Products
                </button>
                <button 
                  onClick={() => scrollToSection('training')}
                  className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  Training
                </button>
                <button 
                  onClick={() => scrollToSection('chatbot')}
                  className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  ChatBot
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => {
                const cartSummary = `Cart Items: ${totalItems}\nTotal Price: ₹${Math.round(useCart.getState().getTotalPrice())}\n\nThis is a demo cart. In a real application, this would redirect to checkout.`;
                alert(cartSummary);
              }}
              className="bg-primary text-white hover:bg-orange-600 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({totalItems})
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <button 
              onClick={() => scrollToSection('home')}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 w-full text-left"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('profile')}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 w-full text-left cursor-pointer"
            >
              Pet Profile
            </button>
            <button 
              onClick={() => scrollToSection('care-tips')}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 w-full text-left cursor-pointer"
            >
              Care Tips
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 w-full text-left"
            >
              Products
            </button>
            <button 
              onClick={() => scrollToSection('training')}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 w-full text-left"
            >
              Training
            </button>
            <button 
              onClick={() => scrollToSection('chatbot')}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 w-full text-left"
            >
              ChatBot
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
