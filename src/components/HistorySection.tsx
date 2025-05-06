"use client";

import React, { useState } from "react";
import {
  Search,
  Calendar,
  Filter,
  ArrowLeft,
  Clock,
  MessageSquare,
  Star,
  StarOff,
  ChevronRight,
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
import { motion, AnimatePresence } from "framer-motion";

interface Conversation {
  id: string;
  title: string;
  date: string;
  preview: string;
  emotions: string[];
  messages: number;
  isFavorite?: boolean;
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
      isFavorite: true,
    },
    {
      id: "2",
      title: "Weekend Plans",
      date: "Yesterday, 8:15 PM",
      preview: "I'm considering taking a short trip to the mountains...",
      emotions: ["excited", "relaxed"],
      messages: 8,
      isFavorite: false,
    },
    {
      id: "3",
      title: "Work Challenges",
      date: "May 15, 2023",
      preview: "The meeting with the client didn't go as expected...",
      emotions: ["frustrated", "determined"],
      messages: 15,
      isFavorite: true,
    },
    {
      id: "4",
      title: "Personal Goals",
      date: "May 10, 2023",
      preview: "I've been thinking about learning a new language...",
      emotions: ["motivated", "curious"],
      messages: 10,
      isFavorite: false,
    },
    {
      id: "5",
      title: "Health Discussion",
      date: "May 5, 2023",
      preview: "I've started a new workout routine and diet plan...",
      emotions: ["determined", "energetic"],
      messages: 18,
      isFavorite: false,
    },
  ],
}: HistorySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [favoritedIds, setFavoritedIds] = useState<string[]>(
    conversations.filter(c => c.isFavorite).map(c => c.id)
  );

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoritedIds(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

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
      !favoritedIds.includes(conversation.id)
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

  // Extract the selected ID safely
  const selectedId: string | null = selectedConversation ? selectedConversation.id : null;

  return (
    <div className="w-full h-full flex flex-col">
      <AnimatePresence mode="wait">
        {!selectedConversation ? (
          <motion.div 
            key="list-view"
            className="w-full h-full flex flex-col p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header - More compact */}
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-base font-semibold">Conversations</h1>
            </div>

            {/* Search and Filter - More compact */}
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8 h-8 bg-background text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Tabs - More compact */}
            <Tabs defaultValue="all" className="w-full" onValueChange={setFilterType}>
              <TabsList className="mb-2 grid grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
                <TabsTrigger value="favorites" className="text-xs">Favorites</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="data-[state=active]:h-[calc(65vh-8rem)]">
                <ConversationList
                  conversations={filteredConversations}
                  onSelect={handleSelectConversation}
                  selectedId={selectedId}
                  favoritedIds={favoritedIds}
                  onToggleFavorite={toggleFavorite}
                />
              </TabsContent>

              <TabsContent value="recent" className="data-[state=active]:h-[calc(65vh-8rem)]">
                <ConversationList
                  conversations={filteredConversations}
                  onSelect={handleSelectConversation}
                  selectedId={selectedId}
                  favoritedIds={favoritedIds}
                  onToggleFavorite={toggleFavorite}
                />
              </TabsContent>

              <TabsContent value="favorites" className="data-[state=active]:h-[calc(65vh-8rem)]">
                <ConversationList
                  conversations={filteredConversations}
                  onSelect={handleSelectConversation}
                  selectedId={selectedId}
                  favoritedIds={favoritedIds}
                  onToggleFavorite={toggleFavorite}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div 
            key="detail-view"
            className="w-full h-full flex flex-col p-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedConversation(null)}
              className="mb-2 w-fit flex items-center gap-1 text-muted-foreground hover:text-foreground pl-1 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
            
            <div className="flex-1 overflow-auto">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-1 py-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{selectedConversation.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => toggleFavorite(selectedConversation.id, e)}
                    >
                      {favoritedIds.includes(selectedConversation.id) ? (
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      ) : (
                        <StarOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {selectedConversation.date}
                    </span>
                    <Separator orientation="vertical" className="h-2.5" />
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {selectedConversation.messages} messages
                    </span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-1 py-1">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {selectedConversation.preview}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedConversation.emotions.map((emotion) => (
                      <Badge key={emotion} variant="secondary" className="font-normal text-[10px] px-1.5 py-0 h-4">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end px-1 pt-2">
                  <Button
                    onClick={() => onSelectConversation(selectedConversation.id)}
                    className="text-xs h-7"
                    size="sm"
                  >
                    Continue Conversation
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Simulated messages - compact view */}
              <div className="mt-3 space-y-2 px-1">
                <h3 className="text-xs font-medium mb-2">Conversation Highlights</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="bg-muted/40 border-none p-2">
                      <p className="text-xs text-muted-foreground">
                        {i % 2 === 0 ? "You: " : "EmpathAI: "}
                        {i === 1 
                          ? "I've been feeling overwhelmed with all the deadlines coming up this week."
                          : i === 2 
                            ? "I understand that feeling. What's your biggest concern about these deadlines?"
                            : "I think it's the fear of not meeting expectations. I want to do quality work but there's so much to do."
                        }
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  selectedId?: string | null;
  favoritedIds: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

function ConversationList({
  conversations,
  onSelect,
  selectedId,
  favoritedIds,
  onToggleFavorite
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 h-full">
        <div className="rounded-full bg-muted/50 p-2 mb-3">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">No conversations found</h3>
        <p className="text-muted-foreground text-xs text-center mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-1">
      <div className="space-y-2 pb-2">
        {conversations.map((conversation) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`
                cursor-pointer transition-all group hover:bg-accent/40 
                ${selectedId === conversation.id ? "border-primary" : "border-border"}
              `}
              onClick={() => onSelect(conversation)}
            >
              <CardHeader className="py-2 px-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">{conversation.title}</CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">
                      {conversation.date}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:ring-0"
                      onClick={(e) => onToggleFavorite(conversation.id, e)}
                    >
                      {favoritedIds.includes(conversation.id) ? (
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      ) : (
                        <Star className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2 px-3 pt-0">
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {conversation.preview}
                </p>
                
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {conversation.emotions.map((emotion) => (
                    <Badge 
                      key={emotion} 
                      variant="outline" 
                      className="text-[9px] px-1 py-0 h-4 font-normal border-muted-foreground/30"
                    >
                      {emotion}
                    </Badge>
                  ))}
                  <Badge 
                    variant="outline" 
                    className="text-[9px] px-1 py-0 h-4 font-normal border-muted-foreground/30 ml-auto"
                  >
                    <MessageSquare className="h-2.5 w-2.5 mr-0.5" />{conversation.messages}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
