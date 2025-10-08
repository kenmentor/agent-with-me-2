"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, List } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
// import { Typography } from "@/components/ui/typography";

const contacts = [
  { id: "1", name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "2", name: "Bob Smith", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: "3", name: "Charlie Lee", avatar: "https://i.pravatar.cc/150?img=3" },
];

export default function ContactList() {
  return (
    <Card className="max-w-md mx-auto mt-10 p-6">
      <h2 className="mb-6 text-2xl font-bold">Contacts</h2>
      {/* <List>
        {contacts.map((contact) => (
          <li key={contact.id} className="mb-2 p-0 list-none">
            <Link
              href={`/chat/${contact.id}`}
              className="flex items-center w-full p-3 rounded-lg hover:bg-primary-50 transition"
            >
              <Avatar
                src={contact.avatar}
                alt={contact.name}
                size="lg"
                className="mr-4"
              />
              <span className="font-medium">{contact.name}</span>
            </Link>
          </li>
        ))}
      </List> */}
    </Card>
  );
}
