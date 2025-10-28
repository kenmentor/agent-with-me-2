import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EditablePropertyCard from "@/components/EditablePropertyCard";
import { MapPin, Edit3, Trash2 } from "lucide-react";

export default function PropertyOverview() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Edit Property
        </h1>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="details" className="w-full">
        {/* Details Tab */}
        <TabsContent value="details">
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <EditablePropertyCard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Map Tab */}
      </Tabs>
    </div>
  );
}
