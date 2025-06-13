import OAuthButton from '@/components/OAuthButton'
import { ThemedText } from '@/components/ThemedText'
import { useSignIn, useSignUp } from '@clerk/clerk-expo'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function AuthScreen() {
  const { signIn, isLoaded: isSignInLoaded, setActive: setSignInActive } = useSignIn()
  const { signUp, isLoaded: isSignUpLoaded, setActive: setSignUpActive } = useSignUp()
  const router = useRouter()

  const [isSignInView, setIsSignInView] = useState(true)
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
    
  const isLoaded = isSignInView ? isSignInLoaded : isSignUpLoaded
  
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded || !signIn) {
      return
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setSignInActive({
          session: signInAttempt.createdSessionId
        })

        router.replace('/')
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    }
  }, [isLoaded, emailAddress, password, router, setSignInActive, signIn])
  
  const onSignUpPress = async () => {
    if (!isLoaded || !signUp) {
      return
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code'
      })

      setPendingVerification(true)
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const onPressVerify = async () => {
    if (!isLoaded || !signUp) {
      return
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setSignUpActive({ session: completeSignUp.createdSessionId })
        router.replace('/')
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2))
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if(!isSignInLoaded || !isSignUpLoaded) {
    return <ActivityIndicator size="large" />
  }

  return (
    <SafeAreaView style={customStyles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[customStyles.headerContainer]}>
        <ThemedText style={customStyles.headerTitle}>
          {isSignInView ? <Text>Welcome to Kozi</Text> : <Text>Create Your Kozi Account</Text>}
        </ThemedText>
      </View>
      
      <View style={[customStyles.formContainer]}>
        {!pendingVerification && (
          <>
            <View style={customStyles.socialButtonsContainer}>]
              <View style={customStyles.socialButtonWrapper}>
                <OAuthButton strategy="oauth_google">
                  <View style={customStyles.socialButton}>
                    <View style={customStyles.socialButtonContent}>
                      <MaterialCommunityIcons name="google" size={18} color="#FFFFFF" style={{marginTop: 1}} />
                      <Text style={{color: '#FFFFFF', marginLeft: 8, fontSize: 16, fontWeight: '500'}}>Google</Text>
                    </View>
                  </View>
                </OAuthButton>
              </View>
            </View>

            <View style={customStyles.dividerContainer}>
              <View style={customStyles.dividerLine} />
              <Text style={customStyles.dividerText}>or</Text>
              <View style={customStyles.dividerLine} />
            </View>

            <Text style={customStyles.inputLabel}>Email address</Text>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              onChangeText={(email) => setEmailAddress(email)}
              style={customStyles.input}
              placeholderTextColor="#A0A0A0"
              placeholder="Enter your email"
            />
            <Text style={customStyles.inputLabel}>Password</Text>
            <TextInput
              value={password}
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
              style={customStyles.input}
              placeholderTextColor="#A0A0A0"
              placeholder={isSignInView ? "Enter your password" : "Create a password"}
            />
            <TouchableOpacity 
              onPress={isSignInView ? onSignInPress : onSignUpPress}
              style={[customStyles.continueButton]}
              disabled={!emailAddress || !password}
            >
              <Text style={customStyles.continueButtonText}>
                {isSignInView ? 'Sign In' : 'Continue'}
              </Text> 
              <Ionicons name='caret-forward' size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setIsSignInView(!isSignInView)}
              style={customStyles.switchModeButton}
            >
              <Text style={customStyles.switchModeText}>
                {isSignInView ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {pendingVerification && (
          <>
            <View style={customStyles.verificationContainer}>
              <ThemedText style={customStyles.verificationTitle}>Verify Your Email</ThemedText>
              <ThemedText style={customStyles.verificationSubtitle}>
                We&apos;ve sent a verification code to {emailAddress}
              </ThemedText>
              
              <Text style={[customStyles.inputLabel, {marginTop: 24}]}>Verification Code</Text>
              <TextInput
                value={code}
                onChangeText={(code) => setCode(code)}
                style={customStyles.input}
                placeholderTextColor="#A0A0A0"
                placeholder="Enter verification code"
                keyboardType="number-pad"
              />
              
              <TouchableOpacity 
                onPress={onPressVerify}
                style={[customStyles.continueButton]}
                disabled={!code}
              >
                <Text style={customStyles.continueButtonText}>Verify Email</Text>
                <Ionicons name='caret-forward' size={18} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => {
                  setPendingVerification(false);
                  setCode('');
                }}
                style={customStyles.backButton}
              >
                <Text style={customStyles.backButtonText}>Back to sign up</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const customStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    
  },
  headerContainer: {
    height: 160, // Fixed height to prevent layout shift
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    flex: 1,
    marginBottom: -40, // Extend past the safe area
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButtonWrapper: {
    flex: 1,
  },
  socialButton: {
    backgroundColor: '#424242',
    borderRadius: 10,
    padding: 6,
    height: 32,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    width: 50,
    textAlign: 'center',
    color: '#757575',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#424242',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  switchModeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 8,
  },
  switchModeText: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '500',
  },
  verificationContainer: {
    paddingVertical: 16,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#757575',
  },
});