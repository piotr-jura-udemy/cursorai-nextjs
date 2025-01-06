import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface TaskCardProps {
  title: string;
  description?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onAssigneeChange?: (userId: string) => void;
}

const TEAM_MEMBERS = [
  { id: "1", name: "John Doe", avatar: "/avatars/john.png" },
  { id: "2", name: "Jane Smith", avatar: "/avatars/jane.png" },
  { id: "3", name: "Mike Johnson", avatar: "/avatars/mike.png" },
];

export function TaskCard({
  title,
  description,
  assignee,
  onAssigneeChange,
}: TaskCardProps) {
  return (
    <Card className="mb-4 cursor-move hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Select value={assignee?.id} onValueChange={onAssigneeChange}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Assign to...">
                {assignee && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                      <AvatarFallback>
                        {assignee.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{assignee.name}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TEAM_MEMBERS.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      {description && (
        <CardContent className="p-4 pt-2 text-sm text-muted-foreground">
          {description}
        </CardContent>
      )}
    </Card>
  );
}
