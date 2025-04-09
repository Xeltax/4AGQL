import React, { useState } from 'react';
import {
    Row,
    Col,
    Card,
    Calendar,
    Badge,
    Typography,
    Space,
    Button,
    Select,
    Modal,
    Radio,
    Form,
    Input,
    DatePicker,
    TimePicker,
    Tooltip,
    Table,
    Tag,
    Tabs,
    Dropdown,
    Menu,
    List,
    Avatar,
    Divider, Descriptions
} from 'antd';
import {
    ScheduleOutlined,
    PlusOutlined,
    FilterOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    BookOutlined,
    UserOutlined,
    ExportOutlined,
    PrinterOutlined,
    SyncOutlined,
    MoreOutlined,
    InfoCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons';
import type { Moment } from 'moment';
import moment from 'moment';
import Layout from '../components/Layout/MainLayout';
import type { NextPage } from 'next';
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Type pour les événements du calendrier
interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    type: string;
    course?: string;
    courseCode?: string;
    professor?: string;
    location: string;
    students?: number;
    description?: string;
    color: string;
    status: string;
}

const Schedule: NextPage = () => {
    const [currentDate, setCurrentDate] = useState(moment());
    const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('week');
    const [isAddEventModalVisible, setIsAddEventModalVisible] = useState(false);
    const [isEventDetailsModalVisible, setIsEventDetailsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Moment | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [filterCourse, setFilterCourse] = useState<string>('all');
    const [filterEventType, setFilterEventType] = useState<string>('all');
    const [form] = Form.useForm();

    // Mock data for demonstration
    const events: CalendarEvent[] = [
        {
            id: 'EVT-1001',
            title: 'Programmation Orientée Objet - Cours',
            start: '2025-04-07T09:00:00',
            end: '2025-04-07T11:00:00',
            type: 'cours',
            course: 'Programmation Orientée Objet',
            courseCode: 'INF-301',
            professor: 'Dr. Pierre Durand',
            location: 'Bâtiment A, Salle 101',
            students: 45,
            description: 'Cours magistral sur l\'héritage et le polymorphisme',
            color: '#1890ff',
            status: 'confirmed'
        },
        {
            id: 'EVT-1002',
            title: 'Bases de Données Avancées - TP',
            start: '2025-04-07T14:00:00',
            end: '2025-04-07T17:00:00',
            type: 'tp',
            course: 'Bases de Données Avancées',
            courseCode: 'INF-302',
            professor: 'Dr. Sophie Bernard',
            location: 'Bâtiment B, Salle 205',
            students: 38,
            description: 'Travaux pratiques sur les requêtes SQL avancées',
            color: '#52c41a',
            status: 'confirmed'
        },
        {
            id: 'EVT-1003',
            title: 'Intelligence Artificielle - Cours',
            start: '2025-04-08T09:00:00',
            end: '2025-04-08T11:00:00',
            type: 'cours',
            course: 'Intelligence Artificielle',
            courseCode: 'INF-304',
            professor: 'Dr. Julie Petit',
            location: 'Bâtiment A, Salle 102',
            students: 35,
            description: 'Introduction aux réseaux de neurones',
            color: '#1890ff',
            status: 'confirmed'
        },
        {
            id: 'EVT-1004',
            title: 'Sécurité Informatique - TP',
            start: '2025-04-08T14:00:00',
            end: '2025-04-08T17:00:00',
            type: 'tp',
            course: 'Sécurité Informatique',
            courseCode: 'INF-305',
            professor: 'Dr. Thomas Martin',
            location: 'Bâtiment B, Salle 206',
            students: 32,
            description: 'Travaux pratiques sur la cryptographie',
            color: '#52c41a',
            status: 'confirmed'
        },
        {
            id: 'EVT-1005',
            title: 'Réunion pédagogique',
            start: '2025-04-09T10:00:00',
            end: '2025-04-09T12:00:00',
            type: 'reunion',
            location: 'Salle de réunion C-120',
            description: 'Réunion avec l\'équipe pédagogique pour discuter des projets de fin d\'année',
            color: '#722ed1',
            status: 'confirmed'
        },
        {
            id: 'EVT-1006',
            title: 'Examen Programmation Orientée Objet',
            start: '2025-04-10T09:00:00',
            end: '2025-04-10T12:00:00',
            type: 'examen',
            course: 'Programmation Orientée Objet',
            courseCode: 'INF-301',
            professor: 'Dr. Pierre Durand',
            location: 'Amphithéâtre D',
            students: 45,
            description: 'Examen intermédiaire sur les concepts de POO',
            color: '#f5222d',
            status: 'confirmed'
        },
        {
            id: 'EVT-1007',
            title: 'Consultation de copies',
            start: '2025-04-11T14:00:00',
            end: '2025-04-11T16:00:00',
            type: 'consultation',
            location: 'Bureau des professeurs',
            description: 'Créneau de consultation des copies pour les étudiants',
            color: '#fa8c16',
            status: 'confirmed'
        },
        {
            id: 'EVT-1008',
            title: 'Soutenance de projets',
            start: '2025-04-12T09:00:00',
            end: '2025-04-12T17:00:00',
            type: 'soutenance',
            course: 'Développement Web',
            courseCode: 'INF-303',
            professor: 'Dr. Marc Lambert',
            location: 'Salles C-101, C-102, C-103',
            students: 42,
            description: 'Soutenances des projets de développement web',
            color: '#faad14',
            status: 'confirmed'
        },
        {
            id: 'EVT-1009',
            title: 'Permanence de tutorat',
            start: '2025-04-09T14:00:00',
            end: '2025-04-09T16:00:00',
            type: 'tutorat',
            location: 'Bibliothèque, Espace de travail',
            description: 'Séance de tutorat pour les étudiants en difficulté',
            color: '#13c2c2',
            status: 'tentative'
        }
    ];

    // Fonction pour filtrer les événements
    const getFilteredEvents = () => {
        return events.filter(event => {
            const matchesCourse = filterCourse === 'all' || event.courseCode === filterCourse;
            const matchesType = filterEventType === 'all' || event.type === filterEventType;
            return matchesCourse && matchesType;
        });
    };

    // Fonction pour obtenir les événements d'une date spécifique
    const getEventsForDate = (date: Moment) => {
        const filteredEvents = getFilteredEvents();
        return filteredEvents.filter(event => {
            const eventStart = moment(event.start);
            return eventStart.isSame(date, 'day');
        });
    };

    // Fonction pour obtenir les événements d'une semaine spécifique
    const getEventsForWeek = (date: Moment) => {
        const startOfWeek = date.clone().startOf('week');
        const endOfWeek = date.clone().endOf('week');
        const filteredEvents = getFilteredEvents();

        return filteredEvents.filter(event => {
            const eventStart = moment(event.start);
            return eventStart.isBetween(startOfWeek, endOfWeek, undefined, '[]');
        });
    };

    // Fonction pour comparer deux dates (utilisée dans le rendu du calendrier)
    const dateCellRender = (value: Moment) => {
        const eventsForDate = getEventsForDate(value);
        return (
            <ul className="events">
                {eventsForDate.map(event => (
                    <li key={event.id} onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}>
                        <Badge
                            color={event.color}
                            text={
                                <Tooltip title={`${event.title} (${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')})`}>
                                    <span className="event-title">{event.title}</span>
                                </Tooltip>
                            }
                        />
                    </li>
                ))}
            </ul>
        );
    };

    // Rendu des cellules du mois
    const monthCellRender = (value: Moment) => {
        const eventsForDate = getEventsForDate(value);
        if (eventsForDate.length === 0) {
            return null;
        }
        return (
            <div className="month-cell-events">
                <Badge count={eventsForDate.length} style={{ backgroundColor: '#1890ff' }} />
            </div>
        );
    };

    // Affichage hebdomadaire
    const renderWeekView = () => {
        const days : any[] = [];
        const startOfWeek = currentDate.clone().startOf('week');
        const eventsForWeek = getEventsForWeek(currentDate);

        // Créer un tableau avec les jours de la semaine
        for (let i = 0; i < 7; i++) {
            const day = startOfWeek.clone().add(i, 'days');
            days.push(day);
        }

        // Heures de la journée (8h à 18h)
        const hours = [];
        for (let i = 8; i <= 18; i++) {
            hours.push(i);
        }

        return (
            <div className="week-view">
                <Row className="week-header">
                    <Col span={2} className="time-column">
                        <div className="time-header">Heure</div>
                    </Col>
                    {days.map((day, index) => (
                        <Col span={Math.floor(22 / 7)} key={index} className="day-column">
                            <div className={`day-header ${day.isSame(moment(), 'day') ? 'today' : ''}`}>
                                <div className="day-name">{day.format('ddd')}</div>
                                <div className="day-number">{day.format('DD')}</div>
                            </div>
                        </Col>
                    ))}
                </Row>

                {hours.map((hour, hIndex) => (
                    <Row className="hour-row" key={hIndex}>
                        <Col span={2} className="time-column">
                            <div className="time-slot">{`${hour}:00`}</div>
                        </Col>
                        {days.map((day, dIndex) => {
                            const dayEvents = eventsForWeek.filter(event => {
                                const eventStart = moment(event.start);
                                const eventHour = eventStart.hour();
                                return eventStart.isSame(day, 'day') && eventHour === hour;
                            });

                            return (
                                <Col span={Math.floor(22 / 7)} key={dIndex} className="day-column">
                                    <div className={`time-slot ${day.isSame(moment(), 'day') ? 'today' : ''}`}>
                                        {dayEvents.map(event => {
                                            const startTime = moment(event.start);
                                            const endTime = moment(event.end);
                                            const durationHours = endTime.diff(startTime, 'hours');

                                            return (
                                                <div
                                                    key={event.id}
                                                    className="event-card"
                                                    style={{
                                                        backgroundColor: event.color,
                                                        height: `${durationHours * 60}px`,
                                                    }}
                                                    onClick={() => handleEventClick(event)}
                                                >
                                                    <div className="event-time">
                                                        {startTime.format('HH:mm')} - {endTime.format('HH:mm')}
                                                    </div>
                                                    <div className="event-title">{event.title}</div>
                                                    <div className="event-location">{event.location}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                ))}
            </div>
        );
    };

    // Affichage journalier
    const renderDayView = () => {
        // Heures de la journée (8h à 18h)
        const hours = [];
        for (let i = 8; i <= 18; i++) {
            hours.push(i);
        }

        const eventsForDay = getEventsForDate(currentDate);

        return (
            <div className="day-view">
                <div className="day-header-large">
                    <div className="day-name-large">{currentDate.format('dddd')}</div>
                    <div className="day-date-large">{currentDate.format('DD MMMM YYYY')}</div>
                </div>

                {hours.map((hour, index) => {
                    const hourEvents = eventsForDay.filter(event => {
                        const eventStart = moment(event.start);
                        const eventHour = eventStart.hour();
                        return eventHour === hour;
                    });

                    return (
                        <div className="hour-block" key={index}>
                            <div className="hour-label">{`${hour}:00`}</div>
                            <div className="hour-content">
                                {hourEvents.map(event => {
                                    const startTime = moment(event.start);
                                    const endTime = moment(event.end);
                                    const durationHours = endTime.diff(startTime, 'hours');

                                    return (
                                        <div
                                            key={event.id}
                                            className="event-card-day"
                                            style={{
                                                backgroundColor: event.color,
                                                height: `${durationHours * 60}px`,
                                            }}
                                            onClick={() => handleEventClick(event)}
                                        >
                                            <div className="event-time">
                                                {startTime.format('HH:mm')} - {endTime.format('HH:mm')}
                                            </div>
                                            <div className="event-title">{event.title}</div>
                                            <div className="event-location">
                                                <EnvironmentOutlined /> {event.location}
                                            </div>
                                            {event.professor && (
                                                <div className="event-professor">
                                                    <UserOutlined /> {event.professor}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Liste des événements
    const renderEventsList = () => {
        const allEvents = getFilteredEvents().sort((a, b) =>
            moment(a.start).valueOf() - moment(b.start).valueOf()
        );

        // Grouper les événements par date
        const eventsByDate: { [key: string]: CalendarEvent[] } = {};
        allEvents.forEach(event => {
            const dateKey = moment(event.start).format('YYYY-MM-DD');
            if (!eventsByDate[dateKey]) {
                eventsByDate[dateKey] = [];
            }
            eventsByDate[dateKey].push(event);
        });

        // Convertir en tableau pour faciliter le rendu
        const groupedEvents = Object.keys(eventsByDate).map(date => ({
            date,
            formattedDate: moment(date).format('dddd, DD MMMM YYYY'),
            events: eventsByDate[date]
        }));

        return (
            <div className="events-list-view">
                {groupedEvents.map((group, groupIndex) => (
                    <div key={groupIndex} className="event-date-group">
                        <div className="event-date-header">
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            {group.formattedDate}
                        </div>
                        <List
                            itemLayout="horizontal"
                            dataSource={group.events}
                            renderItem={event => (
                                <List.Item
                                    actions={[
                                        <Button
                                            key="view"
                                            icon={<EyeOutlined />}
                                            size="small"
                                            onClick={() => handleEventClick(event)}
                                        >
                                            Détails
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Badge
                                                color={event.color}
                                                style={{ width: 8, height: 40 }}
                                            />
                                        }
                                        title={
                                            <Space size={8}>
                                                <Text strong>{event.title}</Text>
                                                <Tag color={event.status === 'confirmed' ? 'green' : 'orange'}>
                                                    {event.status === 'confirmed' ? 'Confirmé' : 'Provisoire'}
                                                </Tag>
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size={0}>
                                                <Space>
                                                    <ClockCircleOutlined />
                                                    {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                                                </Space>
                                                <Space>
                                                    <EnvironmentOutlined />
                                                    {event.location}
                                                </Space>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                ))}
            </div>
        );
    };

    // Gestion des événements
    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsEventDetailsModalVisible(true);
    };

    const handleAddEvent = () => {
        setIsAddEventModalVisible(true);
    };

    const handleAddEventCancel = () => {
        setIsAddEventModalVisible(false);
        form.resetFields();
    };

    const handleEventDetailsClose = () => {
        setIsEventDetailsModalVisible(false);
        setSelectedEvent(null);
    };

    const handleAddEventSubmit = () => {
        form.validateFields()
            .then(values => {
                console.log('Event form values:', values);
                // Ici, vous implémenteriez la logique pour ajouter l'événement
                setIsAddEventModalVisible(false);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    // Gestion du calendrier
    const onCalendarChange = (value: Moment) => {
        setCurrentDate(value);
    };

    const onViewChange = (view: 'month' | 'week' | 'day') => {
        setCurrentView(view);
    };

    const handlePrevious = () => {
        if (currentView === 'month') {
            setCurrentDate(currentDate.clone().subtract(1, 'month'));
        } else if (currentView === 'week') {
            setCurrentDate(currentDate.clone().subtract(1, 'week'));
        } else {
            setCurrentDate(currentDate.clone().subtract(1, 'day'));
        }
    };

    const handleNext = () => {
        if (currentView === 'month') {
            setCurrentDate(currentDate.clone().add(1, 'month'));
        } else if (currentView === 'week') {
            setCurrentDate(currentDate.clone().add(1, 'week'));
        } else {
            setCurrentDate(currentDate.clone().add(1, 'day'));
        }
    };

    const handleToday = () => {
        setCurrentDate(moment());
    };

    // Fonction pour obtenir le titre du calendrier selon la vue
    const getCalendarTitle = () => {
        if (currentView === 'month') {
            return currentDate.format('MMMM YYYY');
        } else if (currentView === 'week') {
            const startOfWeek = currentDate.clone().startOf('week');
            const endOfWeek = currentDate.clone().endOf('week');
            if (startOfWeek.month() === endOfWeek.month()) {
                return `${startOfWeek.format('DD')} - ${endOfWeek.format('DD')} ${endOfWeek.format('MMMM YYYY')}`;
            } else if (startOfWeek.year() === endOfWeek.year()) {
                return `${startOfWeek.format('DD MMMM')} - ${endOfWeek.format('DD MMMM YYYY')}`;
            } else {
                return `${startOfWeek.format('DD MMMM YYYY')} - ${endOfWeek.format('DD MMMM YYYY')}`;
            }
        } else {
            return currentDate.format('DD MMMM YYYY');
        }
    };

    // Options du menu d'export
    const exportMenu = (
        <Menu>
            <Menu.Item key="1" icon={<ExportOutlined />}>
                Exporter au format iCal
            </Menu.Item>
            <Menu.Item key="2" icon={<ExportOutlined />}>
                Exporter au format CSV
            </Menu.Item>
            <Menu.Item key="3" icon={<PrinterOutlined />}>
                Imprimer l'emploi du temps
            </Menu.Item>
        </Menu>
    );

    // Liste des cours pour le filtre
    const courses = [
        { code: 'INF-301', name: 'Programmation Orientée Objet' },
        { code: 'INF-302', name: 'Bases de Données Avancées' },
        { code: 'INF-303', name: 'Développement Web' },
        { code: 'INF-304', name: 'Intelligence Artificielle' },
        { code: 'INF-305', name: 'Sécurité Informatique' }
    ];

    // Types d'événements pour le filtre
    const eventTypes = [
        { value: 'cours', label: 'Cours', color: '#1890ff' },
        { value: 'tp', label: 'TP', color: '#52c41a' },
        { value: 'examen', label: 'Examen', color: '#f5222d' },
        { value: 'reunion', label: 'Réunion', color: '#722ed1' },
        { value: 'soutenance', label: 'Soutenance', color: '#faad14' },
        { value: 'consultation', label: 'Consultation', color: '#fa8c16' },
        { value: 'tutorat', label: 'Tutorat', color: '#13c2c2' }
    ];

    return (
        <Layout>
            <div className="schedule-page">
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                        <h2 style={{color : "red", textAlign : "center", width : "100%"}}>Page de visualisation ! </h2>
                    <Col>
                        <Title level={2}>Emploi du temps</Title>
                        <Text type="secondary">Gestion et visualisation des emplois du temps</Text>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                onClick={handleAddEvent}
                                type="primary"
                                icon={<PlusOutlined />}
                            >
                                Ajouter un événement
                            </Button>
                            <Dropdown overlay={exportMenu} trigger={['click']}>
                                <Button icon={<ExportOutlined />}>
                                    Exporter
                                </Button>
                            </Dropdown>
                        </Space>
                    </Col>
                </Row>

                <Card style={{ marginBottom: 16 }}>
                    <Row gutter={[16, 16]} justify="space-between" align="middle">
                        <Col xs={24} sm={24} md={14}>
                            <Space size="middle">
                                <Button onClick={handlePrevious} icon={<LeftOutlined />} />
                                <Button onClick={handleToday}>Aujourd'hui</Button>
                                <Button onClick={handleNext} icon={<RightOutlined />} />
                                <Title level={4} style={{ margin: 0 }}>{getCalendarTitle()}</Title>
                            </Space>
                        </Col>
                        <Col xs={24} sm={24} md={10} style={{ textAlign: 'right' }}>
                            <Space wrap>
                                <Select
                                    style={{ width: 150 }}
                                    placeholder="Filtrer par cours"
                                    value={filterCourse}
                                    onChange={setFilterCourse}
                                >
                                    <Option value="all">Tous les cours</Option>
                                    {courses.map(course => (
                                        <Option key={course.code} value={course.code}>
                                            {course.code}
                                        </Option>
                                    ))}
                                </Select>
                                <Select
                                    style={{ width: 150 }}
                                    placeholder="Type d'événement"
                                    value={filterEventType}
                                    onChange={setFilterEventType}
                                >
                                    <Option value="all">Tous les types</Option>
                                    {eventTypes.map(type => (
                                        <Option key={type.value} value={type.value}>
                                            <Badge color={type.color} text={type.label} />
                                        </Option>
                                    ))}
                                </Select>
                                <Radio.Group
                                    value={currentView}
                                    onChange={e => onViewChange(e.target.value)}
                                    optionType="button"
                                >
                                    <Radio.Button value="month">Mois</Radio.Button>
                                    <Radio.Button value="week">Semaine</Radio.Button>
                                    <Radio.Button value="day">Jour</Radio.Button>
                                    <Radio.Button value="list">Liste</Radio.Button>
                                </Radio.Group>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Card>
                    <div className="calendar-container">
                        {currentView === 'month' && (
                            <Calendar
                                // @ts-ignore
                                value={currentDate}
                                // @ts-ignore
                                onSelect={onCalendarChange}
                                // @ts-ignore
                                dateCellRender={dateCellRender}
                                // @ts-ignore
                                monthCellRender={monthCellRender}
                            />
                        )}
                        {currentView === 'week' && renderWeekView()}
                        {currentView === 'day' && renderDayView()}
                        {/*{currentView === 'list' && renderEventsList()}*/}
                    </div>
                </Card>

                {/* Légende des événements */}
                <Card style={{ marginTop: 16 }}>
                    <Title level={5}>Légende</Title>
                    <Row gutter={[16, 8]}>
                        {eventTypes.map(type => (
                            <Col key={type.value} xs={12} sm={8} md={6} lg={4} xl={3}>
                                <Badge color={type.color} text={type.label} />
                            </Col>
                        ))}
                    </Row>
                </Card>

                {/* Modal d'ajout d'événement */}
                <Modal
                    title="Ajouter un événement"
                    visible={isAddEventModalVisible}
                    onCancel={handleAddEventCancel}
                    onOk={handleAddEventSubmit}
                    width={700}
                    okText="Ajouter"
                    cancelText="Annuler"
                >
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    name="title"
                                    label="Titre"
                                    rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
                                >
                                    <Input placeholder="Titre de l'événement" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="type"
                                    label="Type"
                                    rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
                                >
                                    <Select placeholder="Type d'événement">
                                        {eventTypes.map(type => (
                                            <Option key={type.value} value={type.value}>
                                                <Badge color={type.color} text={type.label} />
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="course"
                                    label="Cours"
                                    rules={[{ required: false, message: 'Veuillez sélectionner un cours' }]}
                                >
                                    <Select placeholder="Sélectionner un cours">
                                        {courses.map(course => (
                                            <Option key={course.code} value={course.code}>
                                                {course.code} - {course.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="professor"
                                    label="Professeur"
                                    rules={[{ required: false, message: 'Veuillez sélectionner un professeur' }]}
                                >
                                    <Select placeholder="Sélectionner un professeur">
                                        <Option value="Dr. Pierre Durand">Dr. Pierre Durand</Option>
                                        <Option value="Dr. Sophie Bernard">Dr. Sophie Bernard</Option>
                                        <Option value="Dr. Marc Lambert">Dr. Marc Lambert</Option>
                                        <Option value="Dr. Julie Petit">Dr. Julie Petit</Option>
                                        <Option value="Dr. Thomas Martin">Dr. Thomas Martin</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="date"
                                    label="Date"
                                    rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="time"
                                    label="Horaire"
                                    rules={[{ required: true, message: 'Veuillez sélectionner un horaire' }]}
                                >
                                    <TimePicker.RangePicker style={{ width: '100%' }} format="HH:mm" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="location"
                            label="Lieu"
                            rules={[{ required: true, message: 'Veuillez entrer un lieu' }]}
                        >
                            <Input placeholder="Lieu de l'événement" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                        >
                            <Input.TextArea rows={4} placeholder="Description de l'événement..." />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Statut"
                            rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
                        >
                            <Radio.Group>
                                <Radio value="tentative">Provisoire</Radio>
                                <Radio value="confirmed">Confirmé</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal de détails d'événement */}
                <Modal
                    title={
                        <div>
                            <Space align="center">
                                <Badge
                                    color={selectedEvent?.color}
                                    style={{ width: 10, height: 10 }}
                                />
                                <span>Détails de l'événement</span>
                            </Space>
                        </div>
                    }
                    visible={isEventDetailsModalVisible}
                    onCancel={handleEventDetailsClose}
                    footer={[
                        <Button key="close" onClick={handleEventDetailsClose}>
                            Fermer
                        </Button>,
                        <Button key="edit" type="primary" icon={<EditOutlined />}>
                            Modifier
                        </Button>,
                    ]}
                    width={600}
                >
                    {selectedEvent && (
                        <div className="event-details">
                            <Title level={4}>{selectedEvent.title}</Title>

                            <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
                                <Descriptions.Item label="Type">
                                    <Badge color={selectedEvent.color} text={
                                        eventTypes.find(t => t.value === selectedEvent.type)?.label || selectedEvent.type
                                    } />
                                </Descriptions.Item>

                                <Descriptions.Item label="Date et heure">
                                    <Space>
                                        <CalendarOutlined />
                                        {moment(selectedEvent.start).format('dddd, DD MMMM YYYY')}
                                    </Space>
                                    <br />
                                    <Space>
                                        <ClockCircleOutlined />
                                        {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                                    </Space>
                                </Descriptions.Item>

                                <Descriptions.Item label="Lieu">
                                    <Space>
                                        <EnvironmentOutlined />
                                        {selectedEvent.location}
                                    </Space>
                                </Descriptions.Item>

                                {selectedEvent.course && (
                                    <Descriptions.Item label="Cours">
                                        <Space>
                                            <BookOutlined />
                                            {selectedEvent.course} ({selectedEvent.courseCode})
                                        </Space>
                                    </Descriptions.Item>
                                )}

                                {selectedEvent.professor && (
                                    <Descriptions.Item label="Professeur">
                                        <Space>
                                            <UserOutlined />
                                            {selectedEvent.professor}
                                        </Space>
                                    </Descriptions.Item>
                                )}

                                {selectedEvent.students && (
                                    <Descriptions.Item label="Étudiants">
                                        <Space>
                                            <TeamOutlined />
                                            {selectedEvent.students} étudiants
                                        </Space>
                                    </Descriptions.Item>
                                )}

                                <Descriptions.Item label="Statut">
                                    <Badge
                                        status={selectedEvent.status === 'confirmed' ? 'success' : 'warning'}
                                        text={selectedEvent.status === 'confirmed' ? 'Confirmé' : 'Provisoire'}
                                    />
                                </Descriptions.Item>
                            </Descriptions>

                            {selectedEvent.description && (
                                <div style={{ marginTop: 16 }}>
                                    <Title level={5}>Description</Title>
                                    <p>{selectedEvent.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </Layout>
    );
};

export default Schedule;