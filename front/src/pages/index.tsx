import React from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Typography, Space, Badge, Spin } from 'antd';
import {
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import {parse} from "cookie";
import Layout from '../components/Layout/MainLayout';
import type { NextPage, GetServerSideProps } from 'next';
import {usersClient, coursesClient, gradesClient, client} from '../lib/apolloClient';
import { GET_ALL_USERS } from '../graphql/users';
import { GET_ALL_COURSES } from '../graphql/courses';
import { GET_GRADES_FOR_PROFESSOR } from '../graphql/grades';

const { Title, Text } = Typography;

interface DashboardProps {
  initialData: {
    users: any[];
    courses: any[];
    grades: any[];
  }
}

const Dashboard: NextPage<DashboardProps> = ({ initialData }) => {
  const { users, courses, grades } = initialData;

  // Calcul des statistiques
  const totalStudents = users.filter(user => user.role === 'ROLE_USER').length;
  const totalCourses = courses.length;
  const completedCourses = 0; // Cette information n'est pas disponible dans le modèle actuel
  const teachingHours = totalCourses * 8; // Estimation arbitraire de 8h par cours

  // Préparation des données pour les tables
  const recentGrades = grades.slice(0, 5).map((grade, index) => ({
    key: index.toString(),
    student: grade.student?.pseudo || 'N/A',
    course: grade.course?.name || 'N/A',
    grade: grade.note,
    date: new Date(grade.createdAt || Date.now()).toLocaleDateString()
  }));

  // Pour les prochains cours, on utilise simplement la liste des cours
  // Dans un cas réel, il faudrait avoir des données sur les horaires des cours
  const upcomingCourses = courses.slice(0, 3).map((course, index) => ({
    key: index.toString(),
    course: course.name,
    time: '09:00 - 10:30', // Données fictives, non disponibles dans l'API
    room: `Salle ${100 + index}`, // Données fictives, non disponibles dans l'API
    status: index === 0 ? 'active' : 'upcoming' // Juste pour l'affichage
  }));

  const gradeColumns = [
    { title: 'Étudiant', dataIndex: 'student', key: 'student' },
    { title: 'Cours', dataIndex: 'course', key: 'course' },
    {
      title: 'Note',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: number) => (
          <span style={{ color: grade >= 16 ? '#52c41a' : grade >= 12 ? '#1890ff' : '#f5222d' }}>
          {grade}/20
        </span>
      )
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ];

  const courseColumns = [
    { title: 'Cours', dataIndex: 'course', key: 'course' },
    { title: 'Horaire', dataIndex: 'time', key: 'time' },
    { title: 'Salle', dataIndex: 'room', key: 'room' },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
          <Badge
              status={status === 'active' ? 'processing' : 'default'}
              text={status === 'active' ? 'En cours' : 'À venir'}
          />
      )
    },
  ];

  return (
      <Layout>
        <div className="dashboard">
          <Title level={2}>Tableau de bord</Title>
          <Text type="secondary">Bienvenue sur SchoolInc, consultez les informations importantes ci-dessous</Text>

          <div className="stats-overview">
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card className="dashboard-card">
                  <Statistic
                      title="Étudiants"
                      value={totalStudents}
                      prefix={<TeamOutlined />}
                  />
                  <Progress percent={85} showInfo={false} status="active" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="dashboard-card">
                  <Statistic
                      title="Cours"
                      value={totalCourses}
                      prefix={<BookOutlined />}
                  />
                  <Progress percent={65} showInfo={false} status="active" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="dashboard-card">
                  <Statistic
                      title="Cours terminés"
                      value={completedCourses}
                      prefix={<CheckCircleOutlined />}
                  />
                  <Progress percent={(completedCourses / totalCourses) * 100 || 0} showInfo={false} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="dashboard-card">
                  <Statistic
                      title="Heures d'enseignement"
                      value={teachingHours}
                      prefix={<ClockCircleOutlined />}
                  />
                  <Progress percent={70} showInfo={false} status="active" />
                </Card>
              </Col>
            </Row>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Notes récentes" className="dashboard-card">
                {recentGrades.length > 0 ? (
                    <Table
                        dataSource={recentGrades}
                        columns={gradeColumns}
                        pagination={false}
                        size="middle"
                    />
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Text type="secondary">Aucune note récente à afficher</Text>
                    </div>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Prochains cours" className="dashboard-card">
                <Table
                    dataSource={upcomingCourses}
                    columns={courseColumns}
                    pagination={false}
                    size="middle"
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = context.req.headers.cookie || "";
    const parsedCookies = parse(cookies);
    // Récupérer le token d'authentification depuis les cookies
    const token = parsedCookies.JWT || '';

    // Configuration des headers d'authentification pour Apollo Client
    const headers = token ? { authorization: `Bearer ${token}` } : {};

    // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    if (!token) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    try {
      // Exécuter les requêtes en parallèle pour optimiser le temps de chargement
      const [usersResponse, coursesResponse, gradesResponse] = await Promise.all([
        client.query({
          query: GET_ALL_USERS,
          context: { headers }
        }),
        client.query({
          query: GET_ALL_COURSES,
          context: { headers }
        }),
        client.query({
          query: GET_GRADES_FOR_PROFESSOR,
          variables: { courseIds: [] }, // Récupérer les notes pour tous les cours
          context: { headers }
        })
      ]);

      console.log('Users:', usersResponse);

      return {
        props: {
          initialData: {
            users: usersResponse.data.getAllUsers || [],
            courses: coursesResponse.data.getAllCourses || [],
            grades: gradesResponse.data.getGradesForProfessor || []
          }
        }
      };
    } catch (error) {
      console.error('GraphQL Query Error:', error);

      // En cas d'erreur de requête, on retourne quand même la page mais avec des données vides
      // L'utilisateur pourra voir l'interface, mais certaines sections seront vides
      return {
        props: {
          initialData: {
            users: [],
            courses: [],
            grades: [],
            error: {
              message: error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des données'
            }
          }
        }
      };
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error);

    // En cas d'erreur majeure, rediriger vers la page de connexion
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};

export default Dashboard;