import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Scissors, Heart } from "lucide-react";
import type { CareRecommendation } from "@shared/schema";

export default function CareRecommendations() {
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['/api/pet-profiles'],
  });

  const latestProfile = profiles && profiles.length > 0 ? profiles[profiles.length - 1] : null;

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/care-recommendations', latestProfile?.id],
    enabled: !!latestProfile?.id,
  });

  const isLoading = profilesLoading || recommendationsLoading;

  const getIcon = (category: string) => {
    switch (category) {
      case 'nutrition':
        return <Utensils className="w-8 h-8" />;
      case 'grooming':
        return <Scissors className="w-8 h-8" />;
      case 'health':
        return <Heart className="w-8 h-8" />;
      default:
        return <Heart className="w-8 h-8" />;
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case 'nutrition':
        return 'text-accent';
      case 'grooming':
        return 'text-secondary';
      case 'health':
        return 'text-primary';
      default:
        return 'text-primary';
    }
  };

  if (isLoading) {
    return (
      <section id="care-tips" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Personalized Care Tips</h2>
            <p className="text-xl text-gray-600">AI-powered recommendations based on your pet's profile</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card-hover">
                <CardContent className="p-8">
                  <Skeleton className="w-12 h-12 mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-6" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <section id="care-tips" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Personalized Care Tips</h2>
            <p className="text-xl text-gray-600">Create a pet profile to get AI-powered recommendations</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-xl font-semibold mb-2">No Pet Profile Yet</h3>
              <p className="text-gray-600">Create your pet's profile above to receive personalized care recommendations.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="care-tips" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Personalized Care Tips</h2>
          <p className="text-xl text-gray-600">AI-powered recommendations based on your pet's profile</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {recommendations.map((recommendation: CareRecommendation) => (
            <Card key={recommendation.id} className="bg-white card-hover">
              <CardContent className="p-8">
                <div className={`${getIconColor(recommendation.category)} text-4xl mb-4`}>
                  {getIcon(recommendation.category)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{recommendation.title}</h3>
                <p className="text-gray-600 mb-6">{recommendation.description}</p>
                <ul className="space-y-2 text-gray-700">
                  {recommendation.tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
                <div className="mt-6 text-xs text-gray-500">
                  Powered by AI Analysis
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
