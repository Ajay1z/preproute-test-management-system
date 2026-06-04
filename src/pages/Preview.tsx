import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { questionApi } from "../api/questionApi";
import Button from "../components/Button";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { useTestStore } from "../store/testStore";
import { Question } from "../types/question";

const getDraftKey = (testId: string) => `preproute_questions_${testId}`;

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Request failed";
};

const Preview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTest, fetchTestById, updateTest, isLoading } = useTestStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadPreview = async () => {
      try {
        await fetchTestById(id);
        const saved = localStorage.getItem(getDraftKey(id));
        if (saved) {
          setQuestions(JSON.parse(saved) as Question[]);
          return;
        }

        const remoteQuestions = await questionApi.fetchBulk({ test_id: id, testId: id });
        setQuestions(remoteQuestions);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    };

    loadPreview();
  }, [fetchTestById, id]);

  const publishTest = async () => {
    if (!id) return;
    setIsPublishing(true);
    try {
      await updateTest(id, { status: "live" });
      toast.success("Test published successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) return <Loader label="Loading preview" />;

  if (!activeTest) {
    return <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Test not found.</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Preview</h2>
          <p className="mt-1 text-sm text-slate-600">Review the test before publishing.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => navigate(`/tests/create?edit=${activeTest.id}`)}>
            Edit Test
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/tests/${activeTest.id}/questions`)}>
            Edit Questions
          </Button>
          <Button onClick={publishTest} isLoading={isPublishing}>
            Publish Test
          </Button>
        </div>
      </div>

      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-950">{activeTest.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{activeTest.subject}</p>
          </div>
          <StatusBadge status={activeTest.status} />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Type", activeTest.type],
            ["Difficulty", activeTest.difficulty],
            ["Questions", activeTest.total_questions],
            ["Total Marks", activeTest.total_marks],
            ["Total Time", `${activeTest.total_time} min`],
            ["Correct Marks", activeTest.correct_marks],
            ["Wrong Marks", activeTest.wrong_marks],
            ["Unattempt Marks", activeTest.unattempt_marks]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-slate-200 p-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-1 text-sm font-semibold capitalize text-slate-950">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-slate-700">Topics</p>
            <p className="mt-1 text-sm text-slate-600">{activeTest.topics.length ? activeTest.topics.join(", ") : "-"}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Sub Topics</p>
            <p className="mt-1 text-sm text-slate-600">
              {activeTest.sub_topics.length ? activeTest.sub_topics.join(", ") : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-950">Questions</h3>
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <article key={question.id} className="panel p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Question {index + 1}</p>
              <h4 className="mt-2 font-semibold text-slate-950">{question.question}</h4>
              <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <li
                    key={`${question.id}-${optionIndex}`}
                    className={`rounded-md border p-3 text-sm ${
                      question.correct_option === optionIndex + 1
                        ? "border-brand-200 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    {optionIndex + 1}. {option}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-slate-600">{question.explanation}</p>
            </article>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No questions available for preview.
          </div>
        )}
      </div>
    </section>
  );
};

export default Preview;
