import { supabase } from '../lib/supabase'

export const supabaseAuthAPI = {
  // Sign up with email and password
  register: async (userData) => {
    const { email, password, firstName, lastName, role, organization } = userData

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role || 'teacher',
          organization: organization || ''
        }
      }
    })

    if (error) throw error

    return {
      message: 'Registration successful',
      token: data.session?.access_token,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        firstName,
        lastName,
        role: role || 'teacher',
        organization: organization || ''
      }
    }
  },

  // Sign in with email and password
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        role: profile?.role || 'teacher',
        organization: profile?.organization || ''
      }
    }
  },

  // Sign out
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return {
      id: user.id,
      email: user.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      organization: profile.organization
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('user_profiles')
      .update({
        first_name: userData.firstName,
        last_name: userData.lastName,
        organization: userData.organization
      })
      .eq('id', user.id)

    if (error) throw error

    return { message: 'Profile updated successfully' }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    // Verify current password by attempting to sign in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    return { message: 'Password changed successfully' }
  }
}
