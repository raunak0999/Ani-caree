import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertPetProfileSchema, type InsertPetProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function PetProfileForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const form = useForm<InsertPetProfile>({
    resolver: zodResolver(insertPetProfileSchema),
    defaultValues: {
      name: "",
      age: "",
      breed: "",
      size: "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: InsertPetProfile) => {
      const response = await apiRequest('POST', '/api/pet-profiles', data);
      return response.json();
    },
    onSuccess: () => {
      setFormStatus('success');
      // Invalidate both profiles and recommendations
      queryClient.invalidateQueries({ queryKey: ['/api/pet-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/care-recommendations'] });
      
      // Scroll to care tips after a short delay
      setTimeout(() => {
        const element = document.getElementById('care-tips');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Reset form status after scrolling
        setTimeout(() => {
          setFormStatus('idle');
          form.reset();
        }, 3000);
      }, 1000);
      
      toast({
        title: "Profile Created!",
        description: "Personalized recommendations generated!",
      });
    },
    onError: (error) => {
      setFormStatus('idle');
      toast({
        title: "Error",
        description: "Failed to create pet profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPetProfile) => {
    setFormStatus('loading');
    createProfileMutation.mutate(data);
  };

  return (
    <section id="profile" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Create Your Pet's Profile</h2>
          <p className="text-xl text-gray-600">Tell us about your furry friend to get personalized recommendations</p>
        </div>
        
        <Card className="warm-bg shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Pet's Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Buddy"
                  {...form.register("name")}
                  className="w-full"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </Label>
                <Select onValueChange={(value) => form.setValue("age", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Puppy (0-1 years)">Puppy (0-1 years)</SelectItem>
                    <SelectItem value="Young (1-3 years)">Young (1-3 years)</SelectItem>
                    <SelectItem value="Adult (3-7 years)">Adult (3-7 years)</SelectItem>
                    <SelectItem value="Senior (7+ years)">Senior (7+ years)</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.age && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.age.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="breed" className="block text-sm font-semibold text-gray-700 mb-2">
                  Breed
                </Label>
                <Input
                  id="breed"
                  placeholder="e.g., Golden Retriever"
                  {...form.register("breed")}
                  className="w-full"
                />
                {form.formState.errors.breed && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.breed.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="size" className="block text-sm font-semibold text-gray-700 mb-2">
                  Size (Optional)
                </Label>
                <Select onValueChange={(value) => form.setValue("size", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small (0-25 lbs)">Small (0-25 lbs)</SelectItem>
                    <SelectItem value="Medium (25-60 lbs)">Medium (25-60 lbs)</SelectItem>
                    <SelectItem value="Large (60-100 lbs)">Large (60-100 lbs)</SelectItem>
                    <SelectItem value="Extra Large (100+ lbs)">Extra Large (100+ lbs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Button 
                  type="submit" 
                  disabled={formStatus === 'loading'}
                  className="w-full bg-primary text-white py-4 px-8 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {formStatus === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {formStatus === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {formStatus === 'idle' && <Heart className="w-4 h-4 mr-2" />}
                  
                  {formStatus === 'loading' && "Generating Recommendations..."}
                  {formStatus === 'success' && "Recommendations Ready!"}
                  {formStatus === 'idle' && "Get AI Recommendations"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
