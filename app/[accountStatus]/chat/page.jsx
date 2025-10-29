import ChatWithExpert from './components/chat-with-expert'
import ChatWithLearner from './components/chat-with-learner'

export default async function ChatPage({ params }) {
  const resolvedParams = await params
  const { accountStatus } = resolvedParams

  if (accountStatus === 'expert') {
    return <ChatWithLearner />
  } else {
    return <ChatWithExpert />
  }
}
