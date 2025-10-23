'use server';

import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Announcement, UserSuggestion, ForumPost, ForumReply, Poll, PollOption, PollVote } from '@/types';

// Announcements services - using new dedicated service
export { 
  getAnnouncementsByRole as getAnnouncements,
  createAnnouncement 
} from '@/lib/announcements';

// Suggestions services
export async function createSuggestion(suggestionData: Omit<UserSuggestion, 'id' | 'created_at' | 'user_id' | 'is_read'>): Promise<UserSuggestion | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('user_suggestions')
      .insert([{
        ...suggestionData,
        user_id: user.id,
        is_read: false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating suggestion:', error);
      throw error;
    }

    return data as UserSuggestion;
  } catch (error) {
    console.error('Error in createSuggestion:', error);
    return null;
  }
}

export async function getSuggestions(): Promise<UserSuggestion[] | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('user_suggestions')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suggestions:', error);
      return null;
    }

    return data as UserSuggestion[];
  } catch (error) {
    console.error('Error in getSuggestions:', error);
    return null;
  }
}

// Forum services
export async function getForumCategories() {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching forum categories:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getForumCategories:', error);
    return null;
  }
}

export async function getForumPosts(categoryId?: string) {
  try {
    let query = supabase
      .from('forum_posts')
      .select('*, users(name)')
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching forum posts:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getForumPosts:', error);
    return null;
  }
}

export async function createForumPost(postData: Omit<ForumPost, 'id' | 'created_at' | 'user_id'>): Promise<ForumPost | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .insert([{
        ...postData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating forum post:', error);
      throw error;
    }

    return data as ForumPost;
  } catch (error) {
    console.error('Error in createForumPost:', error);
    return null;
  }
}

// Polls services
export async function getPolls(): Promise<Poll[] | null> {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*, poll_options(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching polls:', error);
      return null;
    }

    return data as Poll[];
  } catch (error) {
    console.error('Error in getPolls:', error);
    return null;
  }
}

export async function createPoll(pollData: Omit<Poll, 'id' | 'created_at' | 'user_id'>, options: string[]): Promise<Poll | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Create poll
    const { data: pollDataResult, error: pollError } = await supabase
      .from('polls')
      .insert([{
        ...pollData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (pollError) {
      console.error('Error creating poll:', pollError);
      throw pollError;
    }

    // Create poll options
    const pollOptions = options.map(option => ({
      poll_id: pollDataResult.id,
      option_text: option,
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) {
      console.error('Error creating poll options:', optionsError);
      throw optionsError;
    }

    return pollDataResult as Poll;
  } catch (error) {
    console.error('Error in createPoll:', error);
    return null;
  }
}

export async function voteInPoll(pollId: string, optionId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: User must be logged in');
    }

    // Check if user already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      throw new Error('Anda sudah pernah memberikan suara');
    }

    const { error } = await supabase
      .from('poll_votes')
      .insert([{
        poll_id: pollId,
        poll_option_id: optionId,
        user_id: user.id,
      }]);

    if (error) {
      console.error('Error voting in poll:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in voteInPoll:', error);
    return false;
  }
}