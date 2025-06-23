import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import type { TrainingProgram } from "@shared/schema";

export default function TrainingSection() {
  const { data: trainingPrograms, isLoading } = useQuery({
    queryKey: ['/api/training-programs'],
  });

  const videoTutorials = [
    {
      title: "House Training Basics",
      duration: "5 min video",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      title: "Leash Training Guide", 
      duration: "8 min video",
      image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      title: "Advanced Tricks",
      duration: "12 min video", 
      image: "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      title: "Socialization Tips",
      duration: "10 min video",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    }
  ];

  const getIconColor = (category: string) => {
    switch (category) {
      case 'obedience':
        return 'bg-accent text-white';
      case 'exercise':
        return 'bg-secondary text-white';
      case 'behavioral':
        return 'bg-primary text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <section id="training" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Smart Pet Training</h2>
            <p className="text-xl text-gray-600">Loading training programs...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="training" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Smart Pet Training</h2>
          <p className="text-xl text-gray-600">AI-powered training routines customized for your pet's breed and age</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="Professional dog trainer working with golden retriever" 
              className="rounded-2xl shadow-lg w-full" 
            />
          </div>
          
          <div className="space-y-6">
            {trainingPrograms?.slice(0, 3).map((program: TrainingProgram) => (
              <Card key={program.id} className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`${getIconColor(program.category)} rounded-full w-12 h-12 flex items-center justify-center mr-4`}>
                      <i className={program.icon}></i>
                    </div>
                    <h3 className="text-xl font-bold">{program.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  <ul className="space-y-2 text-gray-700">
                    {program.tips.slice(0, 3).map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                  <Button variant="link" className="mt-4 text-primary font-semibold hover:text-orange-600 p-0">
                    Start Training <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Training Videos Section */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-center mb-8">Training Videos & Tutorials</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="bg-white overflow-hidden card-hover">
                <div className="relative">
                  <img 
                    src={video.image} 
                    alt={video.title}
                    className="w-full h-40 object-cover" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="icon" className="bg-white text-primary rounded-full">
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2">{video.title}</h4>
                  <p className="text-gray-600 text-sm">{video.duration}</p>
                  <Button variant="link" className="mt-3 text-primary font-semibold p-0">
                    <Play className="w-4 h-4 mr-1" />
                    Watch Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
