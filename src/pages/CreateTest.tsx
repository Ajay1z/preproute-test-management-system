import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { subjectApi } from "../api/subjectApi";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { useTestStore } from "../store/testStore";
import { Subject } from "../types/subject";
import { SubTopic } from "../types/subtopic";
import { Topic } from "../types/topic";
import { DIFFICULTIES, TEST_TYPES } from "../utils/constants";

const testSchema = z.object({
  name: z.string().min(2, "Test name is required"),
  subjectId: z.string().min(1, "Subject is required"),
  type: z.string().min(1, "Type is required"),
  topics: z.array(z.string()).min(1, "Select at least one topic"),
  sub_topics: z.array(z.string()),
  difficulty: z.string().min(1, "Difficulty is required"),
  correct_marks: z.coerce.number().min(0, "Correct marks must be 0 or more"),
  wrong_marks: z.coerce.number().max(0, "Wrong marks must be 0 or less"),
  unattempt_marks: z.coerce.number(),
  total_questions: z.coerce.number().min(1, "Total questions is required"),
  total_marks: z.coerce.number().min(1, "Total marks is required"),
  total_time: z.coerce.number().min(1, "Total time is required")
});

type TestFormValues = z.infer<typeof testSchema>;

const initialValues: TestFormValues = {
  name: "",
  subjectId: "",
  type: "mock",
  topics: [],
  sub_topics: [],
  difficulty: "easy",
  correct_marks: 5,
  wrong_marks: -1,
  unattempt_marks: 0,
  total_questions: 50,
  total_marks: 250,
  total_time: 60
};

const selectClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Request failed";
};

const CreateTest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { createTest, updateTest, fetchTestById, isLoading } = useTestStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [editTopicNames, setEditTopicNames] = useState<string[]>([]);
  const [editSubTopicNames, setEditSubTopicNames] = useState<string[]>([]);
  const [isMetaLoading, setIsMetaLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: initialValues
  });

  const subjectId = watch("subjectId");
  const selectedTopics = watch("topics");
  const selectedTopicKey = selectedTopics.join("|");

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === subjectId),
    [subjectId, subjects]
  );

  useEffect(() => {
    const loadInitialData = async () => {
      setIsMetaLoading(true);
      try {
        const subjectList = await subjectApi.getSubjects();
        setSubjects(subjectList);

        if (editId) {
          const test = await fetchTestById(editId);
          const matchedSubject = subjectList.find((subject) => subject.name === test.subject);
          setEditTopicNames(test.topics);
          setEditSubTopicNames(test.sub_topics);
          reset({
            name: test.name,
            subjectId: matchedSubject?.id || "",
            type: test.type,
            topics: [],
            sub_topics: [],
            difficulty: test.difficulty,
            correct_marks: test.correct_marks,
            wrong_marks: test.wrong_marks,
            unattempt_marks: test.unattempt_marks,
            total_questions: test.total_questions,
            total_marks: test.total_marks,
            total_time: test.total_time
          });
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsMetaLoading(false);
      }
    };

    loadInitialData();
  }, [editId, fetchTestById, reset]);

  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      return;
    }

    subjectApi
      .getTopicsBySubject(subjectId)
      .then((topicList) => {
        setTopics(topicList);
        if (editTopicNames.length > 0) {
          const topicIds = topicList.filter((topic) => editTopicNames.includes(topic.name)).map((topic) => topic.id);
          setValue("topics", topicIds, { shouldValidate: true });
        }
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  }, [editTopicNames, setValue, subjectId]);

  useEffect(() => {
    const topicIds = selectedTopicKey ? selectedTopicKey.split("|") : [];

    if (topicIds.length === 0) {
      setSubTopics([]);
      return;
    }

    subjectApi
      .getSubTopicsByTopics(topicIds)
      .then((subTopicList) => {
        setSubTopics(subTopicList);
        if (editSubTopicNames.length > 0) {
          const subTopicIds = subTopicList
            .filter((subTopic) => editSubTopicNames.includes(subTopic.name))
            .map((subTopic) => subTopic.id);
          setValue("sub_topics", subTopicIds, { shouldValidate: true });
        }
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  }, [editSubTopicNames, selectedTopicKey, setValue]);

  const handleMultiSelect = (field: "topics" | "sub_topics", id: string) => {
    const current = watch(field);
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    setValue(field, next, { shouldValidate: true });
  };

  const submitTest = async (values: TestFormValues, nextStep: boolean) => {
    if (!selectedSubject) {
      toast.error("Please select a valid subject");
      return;
    }

    const topicNames = topics.filter((topic) => values.topics.includes(topic.id)).map((topic) => topic.name);
    const subTopicNames = subTopics
      .filter((subTopic) => values.sub_topics.includes(subTopic.id))
      .map((subTopic) => subTopic.name);

    const payload = {
      name: values.name,
      subject: selectedSubject.name,
      type: values.type,
      topics: topicNames,
      sub_topics: subTopicNames,
      difficulty: values.difficulty,
      status: "draft",
      correct_marks: values.correct_marks,
      wrong_marks: values.wrong_marks,
      unattempt_marks: values.unattempt_marks,
      total_questions: values.total_questions,
      total_marks: values.total_marks,
      total_time: values.total_time
    };

    try {
      const savedTest = editId ? await updateTest(editId, payload) : await createTest(payload);
      toast.success(editId ? "Test updated" : "Test draft saved");
      navigate(nextStep ? `/tests/${savedTest.id}/questions` : "/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isMetaLoading) return <Loader label="Loading test setup" />;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{editId ? "Edit Test" : "Create Test"}</h2>
        <p className="mt-1 text-sm text-slate-600">Configure test details, scoring, and taxonomy.</p>
      </div>

      <form className="panel space-y-8 p-5 sm:p-6" onSubmit={handleSubmit((values) => submitTest(values, false))}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Test Name</span>
            <input className={selectClass} {...register("name")} />
            {errors.name ? <span className="mt-1 block text-xs text-rose-600">{errors.name.message}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Subject</span>
            <select className={selectClass} {...register("subjectId")}>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId ? <span className="mt-1 block text-xs text-rose-600">{errors.subjectId.message}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select className={selectClass} {...register("type")}>
              {TEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Difficulty</span>
            <select className={selectClass} {...register("difficulty")}>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Topics Multi Select</p>
            <div className="mt-2 min-h-24 rounded-md border border-slate-200 p-3">
              {topics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleMultiSelect("topics", topic.id)}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${
                        selectedTopics.includes(topic.id)
                          ? "bg-brand-50 text-brand-700 ring-brand-200"
                          : "bg-white text-slate-600 ring-slate-200"
                      }`}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Select a subject to load topics.</p>
              )}
            </div>
            {errors.topics ? <span className="mt-1 block text-xs text-rose-600">{errors.topics.message}</span> : null}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">Sub Topics Multi Select</p>
            <div className="mt-2 min-h-24 rounded-md border border-slate-200 p-3">
              {subTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {subTopics.map((subTopic) => (
                    <button
                      key={subTopic.id}
                      type="button"
                      onClick={() => handleMultiSelect("sub_topics", subTopic.id)}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${
                        watch("sub_topics").includes(subTopic.id)
                          ? "bg-brand-50 text-brand-700 ring-brand-200"
                          : "bg-white text-slate-600 ring-slate-200"
                      }`}
                    >
                      {subTopic.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Select topics to load sub topics.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {(["correct_marks", "wrong_marks", "unattempt_marks", "total_questions", "total_marks", "total_time"] as const).map(
            (field) => (
              <label key={field} className="block">
                <span className="text-sm font-medium capitalize text-slate-700">{field.replace(/_/g, " ")}</span>
                <input type="number" className={selectClass} {...register(field)} />
                {errors[field] ? <span className="mt-1 block text-xs text-rose-600">{errors[field]?.message}</span> : null}
              </label>
            )
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" variant="ghost" isLoading={isLoading}>
            Save Draft
          </Button>
          <Button type="button" isLoading={isLoading} onClick={handleSubmit((values) => submitTest(values, true))}>
            Next Add Questions
          </Button>
        </div>
      </form>
    </section>
  );
};

export default CreateTest;
