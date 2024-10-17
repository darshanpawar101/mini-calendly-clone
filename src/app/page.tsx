import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  Calendar,
  CalendarRange,
  Globe,
  Link,
  Link2,
  Mail,
} from "lucide-react";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { userId } = auth();
  if (userId != null) redirect("/events");
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="text-center container my-4 mx-auto">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 font-semibold mr-auto ">
            <CalendarRange className="size-6" />
            <span className="sr-only md:not-sr-only">Calendly</span>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant={"ghost"}
              className="border-2 border-blue-500 text-blue-700"
            >
              <SignInButton />
            </Button>
            <Button
              asChild
              variant={"ghost"}
              className="bg-blue-500 text-white"
            >
              <SignUpButton />
            </Button>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[repeat(4,1fr)] md:grid-cols-[repeat(2,1fr)] my-40">
          <div className="flex flex-col gap-5 items-center border-2 px-6 py-4 rounded-2xl">
            <div className="bg-blue-100 p-4 rounded-full">
              <Calendar className="size-7 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-blue-600">
              Easy Scheduling
            </div>
            <div>
              Quickly set up and manage events with a simple and intuitive
              interface. Users can choose their availability, and invitees can
              easily book a time that works for everyone.
            </div>
          </div>

          <div className="flex flex-col gap-5 items-center border-2 px-6 py-4 rounded-2xl">
            <div className="bg-pink-100 p-4 rounded-full">
              <Link className="size-7 text-pink-500" />
            </div>
            <div className="text-xl font-bold text-pink-600">
              Calendar Integration
            </div>
            <div>
              Seamlessly sync with popular calendar apps like Google Calendar,
              Outlook, and Apple Calendar to ensure all your events are always
              up-to-date across all devices.
            </div>
          </div>

          <div className="flex flex-col gap-5 items-center border-2 px-6 py-4 rounded-2xl">
            <div className="bg-orange-100 p-4 rounded-full">
              <Mail className="size-7 text-orange-500" />
            </div>
            <div className="text-xl font-bold text-orange-600">
              Automated Reminders
            </div>
            <div>
              Send automatic email and SMS reminders to attendees to reduce
              no-shows. Customize reminder intervals to keep everyone informed
              and prepared.
            </div>
          </div>

          <div className="flex flex-col gap-5 items-center border-2 px-6 py-4 rounded-2xl">
            <div className="bg-green-100 p-4 rounded-full">
              <Globe className="size-7 text-green-500" />
            </div>
            <div className="text-xl font-bold text-green-600">
              Time Zone Detection
            </div>
            <div>
              Automatically detect and adjust for different time zones, making
              scheduling across regions hassle-free. Display all times in the
              user’s local time for convenience.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
