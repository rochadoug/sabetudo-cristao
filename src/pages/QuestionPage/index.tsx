import { useEffect, useState } from "react";
import Timer from "./Timer";
import "./styles.css";
import { useUser } from "../../contexts/UserContext";
import { useQuestions, type Answer } from "../../hooks/useQuestions";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";

const TOTAL_TIME = 15000; // 15s reais
const TICK = 50;         // atualização visual (20fps)

function QuestionPage() {
  const [selected, setSelected] = useState<Answer | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);

  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'info' | 'error' | 'success';
  } | null>(null);

  const { user, registerCorrectAnswer } = useUser();
  const { questions, loading } = useQuestions(user);
  const navigate = useNavigate();
  const current = questions[questionIndex];
  //console.log("Questions da page", questions);
  // define pergunta inicial
  useEffect(() => {
    if (!loading && questions.length > 0) {
      setQuestionIndex(0);
      setStartedAt(Date.now());
      setTimeLeft(TOTAL_TIME);
    }
  }, [loading, questions]);

  //para o timer
  useEffect(() => {
    if (selected !== null) return;
    if (timedOut) return;
    if (!startedAt) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(TOTAL_TIME - elapsed, 0);

      setTimeLeft(remaining);

      if (remaining === 0) {
        setTimedOut(true);
        clearInterval(interval);
      }
    }, TICK);

    return () => clearInterval(interval);
  }, [startedAt, selected, timedOut]);

  function showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  function handleNextQuestion() {
    if (toast !== null) return;

    const nextIndex = questionIndex + 1;

    if (nextIndex >= questions.length) {
      navigate("/result",{
        state:{
          corrects: roundCorrect,
          total: questions.length
        }
      });
      return;
    }

    setSelected(null);
    setTimedOut(false);
    setStartedAt(Date.now());
    setTimeLeft(TOTAL_TIME);
    setQuestionIndex(nextIndex);
  }

  function handleAnswer(answer: Answer) {
    if (!current || selected !== null || timedOut) return;

    setSelected(answer);

    if (answer.correct === true) {
      setRoundCorrect(prev => prev + 1);

      const goldRewarded = registerCorrectAnswer(current.id);
      if (goldRewarded > 0) {
        // rewardGold();
        showToast("Ouro + 1", 'info');
      }
    }
  }

  const optWord: string[] = ["A. ", "B. ", "C. ", "D. "];

  if (loading || !current) {
    return <p>Carregando perguntas...</p>;
  }

  return (
    <main className="page">
      <Timer timeLeft={timeLeft} maxTime={TOTAL_TIME} />

      <div className="question-meta">
        <span>
          Pergunta {questionIndex + 1} / {questions.length}
        </span>

        <div className="round-progress">
          Acertos: {roundCorrect}
        </div>
      </div>

      <div className="question-wrapper" key={current.id}>
        <div className="card">
          <p>{current.text}</p>
        </div>

        <div className="answers">
          {current.answers.map((opt, index) => {
            let className = "answer-btn";

            if (selected !== null) {
              if (opt.correct) className += " correct";
              if (opt === selected && !opt.correct) {
                className += " wrong";
              }
            }
            else if (timedOut === true) {
              if (opt.correct) className += " timelost";
            }

            return (
              <button
                key={index}
                className={className}
                disabled={selected !== null || timedOut}
                onClick={() => handleAnswer(opt)}
              >
                {optWord[index]} {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      {(selected !== null || timedOut === true) && (
        <div className="feedback">
          {timedOut ? (
            <p>
              ⏱️ Tempo esgotado.
              <span className="verse">Ref: {current.verse}</span>
            </p>
          ) : selected?.correct ? (
            <p>
              Você acertou!{" "}
              <span className="verse">Ref: {current.verse}</span>
            </p>
          ) : (
            <p>
              Você errou.{" "}
              <span className="verse">Ref: {current.verse}</span>
            </p>
          )}

          <button className="next-btn" onClick={handleNextQuestion}>
            Próxima pergunta
          </button>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </main>
  );
}

export default QuestionPage;
