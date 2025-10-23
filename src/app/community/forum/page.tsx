import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase';
import { getForumCategories, getForumPosts } from '@/lib/community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, User, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function ForumPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  const userProfile = await getUserProfile(clerkUser.id);
  
  if (!userProfile) {
    redirect('/onboarding');
  }

  const categories = await getForumCategories();
  const posts = await getForumPosts();
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy HH:mm', { locale: id });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Forum Komunitas</h1>
            <p className="text-muted-foreground">
              Berdiskusi dengan warga lainnya di lingkungan perumahan
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Postingan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Postingan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <div key={post.id} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{post.users?.name || 'Anonim'}</span>
                          <span>•</span>
                          <span className="text-muted-foreground">{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>12 balasan</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2">Belum ada postingan forum</p>
                  <p className="text-sm text-muted-foreground">Jadilah yang pertama membuat postingan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categories && categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.map((category: any) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada kategori</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Statistik Forum</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Postingan</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span>Balasan</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span>Warga Aktif</span>
                  <span className="font-medium">42</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}