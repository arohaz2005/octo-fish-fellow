import { Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'react-hot-toast'

import HomePage from "./pages/HomePage.jsx"
import SignUpPage from "./pages/SignUpPage.jsx"
import LoginPage from './pages/LoginPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import NotificationPage from './pages/NotificationPage.jsx'
import CallPage from "./pages/CallPage.jsx"

import PageLoader from './components/PageLoader.jsx'
import Layout from './components/Layout.jsx'

import useisAuthenticated from './hooks/useAuthUser.js'
import { useThemeStore } from '../store/useThemeStore.js'


const App = () => {

  const { theme } = useThemeStore();

  //tanstack query
  const { isLoading, authUser } = useisAuthenticated();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded

  if(isLoading)
    return <PageLoader/>

  return (
    <div className= "h-screen" data-theme={theme}>
      
      <Routes>

          <Route 
            path="/" 
                  element= {
                      isAuthenticated && isOnboarded ? (
                          <Layout showSidebar={true}>
                            <HomePage />
                          </Layout> 
                      ) : (
                          <Navigate to={ !isAuthenticated ? "/login" : "/onboarding" }/>
                      )
                  } 
          />

          <Route 
            path="/signup" 
              element={ 
                !isAuthenticated ? <SignUpPage /> : <Navigate to= { isOnboarded ? "/" : "/onboarding"} /> 
              } 
          />

          <Route 
            path="/login" 
              element={ 
                !isAuthenticated ? (
                  <LoginPage />
                ) : (
                  <Navigate to= { 
                    isOnboarded ? "/" : "/onboarding"
                  }/>
                )
              } 
          />
          
          <Route 
            path="/onboarding" 
              element={ 
                  isAuthenticated ? (
                    !isOnboarded ? (
                      <OnboardingPage />
                    ) : (
                      <Navigate to= "/" />
                    )
                  ) : (
                  <Navigate to= "/login" />
                  )
              } 
          />
          
          <Route 
            path="/notifications" 
              element={ 
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <NotificationPage />
                  </Layout>
                ) : (
                  <Navigate to= {
                    !isAuthenticated ? (
                      "/login"
                    ) : (
                      "/onboarding"
                    )
                  }/>
                )
              } 
          />

          <Route
            path="/chat/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />  
                            
          <Route 
            path="/call/:id"
              element={
              isAuthenticated && isOnboarded ? (
                <CallPage />
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

      </Routes>

      <Toaster />
      
    </div>
  )
}

export default App;
