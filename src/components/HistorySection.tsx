"use client";

import React, { useState } from "react";
import {
  Search,
  Calendar,
  Filter,
  ArrowLeft,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

interface Conversation {
  id: string;
  title: string;
  date: string;
  preview: string;
  emotions: string[];
  messages: number;
}

interface HistorySectionProps {
  onSelectConversation?: (conversationId: string) => void;
  onReturnToMain?: () => void;
  conversations?: Conversation[];
}

export default function HistorySection({
  onSelectConversation = () => {},
  onReturnToMain = () => {},
  conversations = [
    {
      id: "1",
      title: "Morning Reflection",
      date: "Today, 9:30 AM",
      preview: "I've been thinking about the project deadline coming up...",
      emotions: ["anxious", "hopeful"],
      messages: 12,
    },
    {
      id: "2",
      title: "Weekend Plans",
      date: "Yesterday, 8:15 PM",
      preview: "I'm considering taking a short trip to the mountains...",
      emotions: ["excited", "relaxed"],
      messages: 8,
    },
    {
      id: "3",
      title: "Work Challenges",
      date: "May 15, 2023",
      preview: "The meeting with the client didn't go as expected...",
      emotions: ["frustrated", "determined"],
      messages: 15,
    },
    {
      id: "4",
      title: "Personal Goals",
      date: "May 10, 2023",
      preview: "I've been thinking about learning a new language...",
      emotions: ["motivated", "curious"],
      messages: 10,
    },
    {
      id: "5",
      title: "Health Discussion",
      date: "May 5, 2023",
      preview: "I've started a new workout routine and diet plan...",
      emotions: ["determined", "energetic"],
      messages: 18,
    },
  ],
}: HistorySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [filterType, setFilterType] = useState("all");

  const filteredConversations = conversations.filter((conversation) => {
    // Apply search filter
    if (
      searchQuery &&
      !conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !conversation.preview.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Apply tab filter
    if (
      filterType === "recent" &&
      !conversation.date.includes("Today") &&
      !conversation.date.includes("Yesterday")
    ) {
      return false;
    }

    // Apply favorites filter
    if (
      filterType === "favorites" &&
      conversation.id !== "1" &&
      conversation.id !== "3"
    ) {
      return false;
    }

    return true;
  });

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    onSelectConversation(conversation.id);
  };

  const handleReturnToMain = () => {
    setSelectedConversation(null);
    onReturnToMain();
  };

  return (
    <div className="w-full h-full bg-background flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleReturnToMain}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Conversation History</h1>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setFilterType}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Conversations</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-0">
          <ConversationList
            conversations={filteredConversations}
            onSelect={handleSelectConversation}
            selectedId={selectedConversation?.id}
          />
        </TabsContent>

        <TabsContent value="recent" className="space-y-0">
          <ConversationList
            conversations={filteredConversations}
            onSelect={handleSelectConversation}
            selectedId={selectedConversation?.id}
          />
        </TabsContent>

        <TabsContent value="favorites" className="space-y-0">
          <ConversationList
            conversations={filteredConversations}
            onSelect={handleSelectConversation}
            selectedId={selectedConversation?.id}
          />
        </TabsContent>
      </Tabs>

      {/* Selected Conversation Detail */}
      {selectedConversation && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedConversation.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> {selectedConversation.date}
                <Separator orientation="vertical" className="h-4" />
                <MessageSquare className="h-4 w-4" />{" "}
                {selectedConversation.messages} messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {selectedConversation.preview}
              </p>
              <div className="flex gap-2 mt-4">
                {selectedConversation.emotions.map((emotion) => (
                  <Badge key={emotion} variant="secondary">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedConversation(null)}
              >
                Back
              </Button>
              <Button
                onClick={() => onSelectConversation(selectedConversation.id)}
              >
                Continue Conversation
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  selectedId?: string | null;
}

function ConversationList({
  conversations,
  onSelect,
  selectedId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No conversations found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <Card
            key={conversation.id}
            className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedId === conversation.id ? "border-primary" : ""}`}
            onClick={() => onSelect(conversation)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{conversation.title}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {conversation.date}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {conversation.preview}
              </p>
              <div className="flex gap-2 mt-3">
                {conversation.emotions.map((emotion) => (
                  <Badge key={emotion} variant="outline" className="text-xs">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
