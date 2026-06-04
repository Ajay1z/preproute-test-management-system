import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { questionApi } from "../api/questionApi";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { useTestStore } from "../store/testStore";
import { Question } from "../types/question";
import { DIFFICULTIES } from "../utils/constants";

const questionSchema = z.object({
  question: z.string().min(5, "Question is required"),
  option1: z.string().min(1, "Option 1 is required"),
  option2: z.string().min(1, "Option 2 is required"),
  option3: z.string().min(1, "Option 3 is required"),
  option4: z.string().min(1, "Option 4 is required"),
  correct_option: z.coerce.number().min(1).max(4),
  explanation: z.string().min(1, "Explanation is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  topic: z.string().min(1, "Topic is required"),
  sub_topic: z.string(),
  media_url: z.string().url("Enter a valid URL").or(z.literal(""))
});

type QuestionFormValues = z.infer<typeof questionSchema>;

const emptyQuestion: QuestionFormValues = {
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correct_option: 1,
  explanation: "",
  difficulty: "easy",
  topic: "",
  sub_topic: "",
  media_url: ""
};

const selectClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

const getDraftKey = (testId: string) => `preproute_questions_${testId}`;

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Request failed";
};

const toFormValues = (question: Question): QuestionFormValues => ({
  question: question.question,
  option1: question.options[0],
  option2: question.options[1],
  option3: question.options[2],
  option4: question.options[3],
  correct_option: question.correct_option,
  explanation: question.explanation,
  difficulty: question.difficulty,
  topic: question.topic,
  sub_topic: question.sub_topic,
  media_url: question.media_url
});

const Questions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTest, fetchTestById, isLoading } = useTestStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: emptyQuestion
  });

  const topicOptions = useMemo(() => activeTest?.topics || [], [activeTest]);
  const subTopicOptions = useMemo(() => activeTest?.sub_topics || [], [activeTest]);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
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

    loadData();
  }, [fetchTestById, id]);

  useEffect(() => {
    if (id) {
      localStorage.setItem(getDraftKey(id), JSON.stringify(questions));
    }
  }, [id, questions]);

  const upsertQuestion = (values: QuestionFormValues) => {
    const nextQuestion: Question = {
      id: editingId || crypto.randomUUID(),
      question: values.question,
      options: [values.option1, values.option2, values.option3, values.option4],
      correct_option: values.correct_option,
      explanation: values.explanation,
      difficulty: values.difficulty,
      topic: values.topic,
      sub_topic: values.sub_topic,
      media_url: values.media_url
    };

    setQuestions((current) =>
      editingId ? current.map((item) => (item.id === editingId ? nextQuestion : item)) : [...current, nextQuestion]
    );
    setEditingId(null);
    reset(emptyQuestion);
    toast.success(editingId ? "Question updated" : "Question added");
  };

  const editQuestion = (question: Question) => {
    setEditingId(question.id);
    reset(toFormValues(question));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions((current) => current.filter((question) => question.id !== questionId));
    if (editingId === questionId) {
      setEditingId(null);
      reset(emptyQuestion);
    }
    toast.info("Question removed from draft");
  };

  const saveQuestions = async () => {
    if (!id) return;
    if (questions.length === 0) {
      toast.error("Add at least one question before saving");
      return;
    }

    setIsSaving(true);
    try {
      await questionApi.saveBulk({
        test_id: id,
        testId: id,
        questions: questions.map((question) => ({
          question: question.question,
          options: question.options,
          correct_option: question.correct_option,
          explanation: question.explanation,
          difficulty: question.difficulty,
          topic: question.topic,
          sub_topic: question.sub_topic,
          media_url: question.media_url
        }))
      });
      toast.success("Questions saved");
      navigate(`/tests/${id}/preview`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader label="Loading test questions" />;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Questions</h2>
          <p className="mt-1 text-sm text-slate-600">{activeTest?.name || "Add questions to this test."}</p>
        </div>
        <Button onClick={saveQuestions} isLoading={isSaving}>
          Save Questions
        </Button>
      </div>

      <form className="panel space-y-5 p-5 sm:p-6" onSubmit={handleSubmit(upsertQuestion)}>
        <Input label="Question" textarea error={errors.question} {...register("question")} />

        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Option 1" error={errors.option1} {...register("option1")} />
          <Input label="Option 2" error={errors.option2} {...register("option2")} />
          <Input label="Option 3" error={errors.option3} {...register("option3")} />
          <Input label="Option 4" error={errors.option4} {...register("option4")} />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="text-sm font-medium text-slate-700">Correct Option</span>
            <select className={selectClass} {...register("correct_option")}>
              {[1, 2, 3, 4].map((option) => (
                <option key={option} value={option}>
                  Option {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-medium text-slate-700">Difficulty</span>
            <select className={selectClass} {...register("difficulty")}>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-medium text-slate-700">Topic</span>
            <select className={selectClass} {...register("topic")}>
              <option value="">Select topic</option>
              {topicOptions.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            {errors.topic ? <span className="mt-1 block text-xs text-rose-600">{errors.topic.message}</span> : null}
          </label>

          <label>
            <span className="text-sm font-medium text-slate-700">Sub Topic</span>
            <select className={selectClass} {...register("sub_topic")}>
              <option value="">None</option>
              {subTopicOptions.map((subTopic) => (
                <option key={subTopic} value={subTopic}>
                  {subTopic}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Input label="Explanation" textarea error={errors.explanation} {...register("explanation")} />
        <Input label="Media URL" error={errors.media_url} placeholder="https://example.com/media.png" {...register("media_url")} />

        <div className="flex justify-end gap-3">
          {editingId ? (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                reset(emptyQuestion);
              }}
            >
              Cancel Edit
            </Button>
          ) : null}
          <Button type="submit">{editingId ? "Update Question" : "Add Question"}</Button>
        </div>
      </form>

      <div className="space-y-3">
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <article key={question.id} className="panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">Question {index + 1}</p>
                  <h3 className="mt-1 font-semibold text-slate-950">{question.question}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Correct: Option {question.correct_option} | {question.difficulty}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="min-h-9 px-3" onClick={() => editQuestion(question)}>
                    Edit
                  </Button>
                  <Button variant="danger" className="min-h-9 px-3" onClick={() => deleteQuestion(question.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No questions added yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default Questions;
