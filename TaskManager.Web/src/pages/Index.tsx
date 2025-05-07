
import { Layout } from "@/components/Layout";
import { TaskList } from "@/components/TaskList";
import { TaskStats } from "@/components/TaskStats";

const Index = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Gerenciador de Tarefas</h1>
      <TaskStats />
      <TaskList />
    </Layout>
  );
};

export default Index;
