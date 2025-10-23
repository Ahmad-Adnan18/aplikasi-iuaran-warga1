import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getPolls, voteInPoll } from '@/lib/community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, CheckCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function PollsPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding');
  }

  const polls = await getPolls();
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tidak ada batas waktu';
    return format(new Date(dateString), 'd MMMM yyyy', { locale: id });
  };

  // Handle voting
  const handleVote = async (pollId: string, optionId: string) => {
    'use server';
    await voteInPoll(pollId, optionId);
    // In a real app, we would redirect to refresh the page with new vote counts
    redirect('/community/polls');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Jajak Pendapat</h1>
        <p className="text-muted-foreground">
          Berikan suara Anda dalam polling komunitas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls && polls.length > 0 ? (
          polls.map((poll: any) => {
            const optionsWithVotes = poll.poll_options.map((option: any) => {
              // In a real app, we would fetch the vote count for each option
              return {
                ...option,
                voteCount: Math.floor(Math.random() * 10) + 1, // Mock data
                percentage: Math.floor(Math.random() * 50) + 10, // Mock data
              };
            });
            
            // Mock data for whether current user has voted
            const hasVoted = Math.random() > 0.5; // Mock data

            return (
              <Card key={poll.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{poll.question}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>Admin</span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Selesai: {formatDate(poll.expires_at)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {hasVoted ? (
                    <div className="space-y-3">
                      {optionsWithVotes.map((option: any) => (
                        <div key={option.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{option.option_text}</span>
                            <span>{option.percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${option.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {option.voteCount} suara
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {optionsWithVotes.map((option: any) => (
                        <form 
                          key={option.id} 
                          className="w-full"
                          action={async () => {
                            'use server';
                            await voteInPoll(poll.id, option.id);
                            redirect('/community/polls');
                          }}
                        >
                          <Button 
                            variant="outline" 
                            className="w-full justify-start mb-2"
                            type="submit"
                          >
                            {option.option_text}
                          </Button>
                        </form>
                      ))}
                    </div>
                  )}
                  
                  {hasVoted && (
                    <div className="mt-3 flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Anda telah memberikan suara
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2">Belum ada jajak pendapat</p>
            <p className="text-sm text-muted-foreground">Jajak pendapat akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
}