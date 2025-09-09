--
-- PostgreSQL database dump
--

\restrict gmbasqLIYQsDcSlAM5uWa57QvPreph1pxdrPcpW4nkF7sEPemQkd9icU2E8H7to

-- Dumped from database version 16.10 (Homebrew)
-- Dumped by pg_dump version 16.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--

INSERT INTO public.workers VALUES ('b50e63ba-8abd-46d2-99a7-6474e896ebf3', 'Arun', 'rojdaar', 370.00, NULL, NULL, 'Vitala, Pulgaon', '2025-09-01', true, 0.00);
INSERT INTO public.workers VALUES ('a12234f8-5abc-4020-98f7-2c6e2e157afb', 'Mohommad', 'rojdaar', 450.00, NULL, NULL, 'Him Bricks Pulgaon', '2025-09-01', true, 0.00);
INSERT INTO public.workers VALUES ('5feb3d5c-5c50-41dd-9110-143236d1cfd4', 'Gnyaneshwar (buaa)', 'rojdaar', 350.00, NULL, NULL, NULL, '2025-09-01', true, 0.00);
INSERT INTO public.workers VALUES ('2a88af02-271a-4ce1-affa-8b55b9facb68', 'RAMDAS', 'driver', NULL, NULL, NULL, NULL, '2025-09-01', true, 0.00);
INSERT INTO public.workers VALUES ('375e3985-5ab6-4d93-84a9-8364afbe338d', 'TRUCK/TRACTOR LABOR', 'driver', NULL, NULL, NULL, NULL, '2025-09-01', true, 0.00);
INSERT INTO public.workers VALUES ('24a1f3ec-045b-45ff-95dc-a9d22e5b9542', 'MANOR', 'driver', NULL, NULL, NULL, NULL, '2025-09-01', true, -2000.00);


--
-- Data for Name: advance_payments; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--

INSERT INTO public.advance_payments VALUES ('c6035ae1-b995-42ac-9c7a-11a048c86468', '24a1f3ec-045b-45ff-95dc-a9d22e5b9542', 2000.00, 'personal', '2025-09-01 11:41:01.936', '', 0.00);


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--

INSERT INTO public.attendance VALUES ('70f1354f-3486-43e7-beb9-6adbd2928999', 'a12234f8-5abc-4020-98f7-2c6e2e157afb', '2025-08-26', true, 0, NULL, '2025-09-01 11:16:17.244');
INSERT INTO public.attendance VALUES ('86196920-6705-4b04-a8f7-102fbadaa30e', '5feb3d5c-5c50-41dd-9110-143236d1cfd4', '2025-08-27', false, 0, NULL, '2025-09-01 11:16:34.921');
INSERT INTO public.attendance VALUES ('97393d43-c1f3-47e4-98ab-42b73c2d16e1', '5feb3d5c-5c50-41dd-9110-143236d1cfd4', '2025-08-28', false, 0, NULL, '2025-09-01 11:16:45.764');
INSERT INTO public.attendance VALUES ('a7894b4e-7a97-4c3f-b5f2-b9339b7099d6', 'b50e63ba-8abd-46d2-99a7-6474e896ebf3', '2025-08-26', true, 0, NULL, '2025-09-01 11:16:17.244');
INSERT INTO public.attendance VALUES ('e9a9c2e4-3470-4d4f-9660-4f81bf60cf3b', '5feb3d5c-5c50-41dd-9110-143236d1cfd4', '2025-08-26', false, 0, NULL, '2025-09-01 11:16:17.245');
INSERT INTO public.attendance VALUES ('e969ffab-e44c-4b3e-95d4-08dc2657d94f', 'b50e63ba-8abd-46d2-99a7-6474e896ebf3', '2025-08-27', false, 0, NULL, '2025-09-01 11:16:34.92');
INSERT INTO public.attendance VALUES ('8170a478-c0aa-42fb-b597-71fe9d0eae21', 'a12234f8-5abc-4020-98f7-2c6e2e157afb', '2025-08-27', true, 0, NULL, '2025-09-01 11:16:34.92');
INSERT INTO public.attendance VALUES ('f644ea54-e77e-4744-a82d-68ee5bcc883a', 'b50e63ba-8abd-46d2-99a7-6474e896ebf3', '2025-08-28', false, 0, NULL, '2025-09-01 11:16:45.763');
INSERT INTO public.attendance VALUES ('2639bff0-0c2d-40f9-89ee-f140629efc83', 'a12234f8-5abc-4020-98f7-2c6e2e157afb', '2025-08-28', true, 0, NULL, '2025-09-01 11:16:45.764');
INSERT INTO public.attendance VALUES ('a820c0ec-6946-45bd-abb4-4cb34a633d20', 'b50e63ba-8abd-46d2-99a7-6474e896ebf3', '2025-08-29', false, 0, NULL, '2025-09-01 11:17:21.428');
INSERT INTO public.attendance VALUES ('b66f7b2c-54a6-41da-b613-7609b0af2e90', 'a12234f8-5abc-4020-98f7-2c6e2e157afb', '2025-08-29', true, 0, NULL, '2025-09-01 11:17:21.428');
INSERT INTO public.attendance VALUES ('b30ab45f-4b3c-47fa-8275-7c6478761fd8', '5feb3d5c-5c50-41dd-9110-143236d1cfd4', '2025-08-29', false, 0, NULL, '2025-09-01 11:17:21.429');
INSERT INTO public.attendance VALUES ('59dfc205-3202-4392-96a7-2b476516b04d', 'b50e63ba-8abd-46d2-99a7-6474e896ebf3', '2025-08-30', true, 0, NULL, '2025-09-01 11:17:34.651');
INSERT INTO public.attendance VALUES ('7033d8e6-da29-433b-b735-7c71952a9b13', 'a12234f8-5abc-4020-98f7-2c6e2e157afb', '2025-08-30', true, 0, NULL, '2025-09-01 11:17:34.652');
INSERT INTO public.attendance VALUES ('b17e13bb-af99-45cf-a94d-aeaf55cda574', '5feb3d5c-5c50-41dd-9110-143236d1cfd4', '2025-08-30', true, 0, NULL, '2025-09-01 11:17:34.652');
INSERT INTO public.attendance VALUES ('8d7ea6a5-0135-47f6-b65f-246da62b0772', 'b50e63ba-8abd-46d2-99a7-6474e896ebf3', '2025-08-31', true, 0, NULL, '2025-09-01 11:17:44.514');
INSERT INTO public.attendance VALUES ('9bbcc455-f60c-41b8-b5b7-39b2f6352a54', 'a12234f8-5abc-4020-98f7-2c6e2e157afb', '2025-08-31', true, 0, NULL, '2025-09-01 11:17:44.515');
INSERT INTO public.attendance VALUES ('c812eca1-b509-4adb-a01a-45ec5746806f', '5feb3d5c-5c50-41dd-9110-143236d1cfd4', '2025-08-31', true, 0, NULL, '2025-09-01 11:17:44.516');
INSERT INTO public.attendance VALUES ('4c47a97e-639d-4c9c-a21a-bf25401cc581', 'b50e63ba-8abd-46d2-99a7-6474e896ebf3', '2025-09-01', true, 0, NULL, '2025-09-01 11:17:59.051');
INSERT INTO public.attendance VALUES ('479f45b9-4af9-4094-8fe9-6623a8ed89b7', 'a12234f8-5abc-4020-98f7-2c6e2e157afb', '2025-09-01', true, 0, NULL, '2025-09-01 11:17:59.052');
INSERT INTO public.attendance VALUES ('90b14f21-1e69-4ccb-ade3-68b0be7ed653', '5feb3d5c-5c50-41dd-9110-143236d1cfd4', '2025-09-01', true, 0, NULL, '2025-09-01 11:17:59.052');


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--

INSERT INTO public.customers VALUES ('ffc82a7a-338b-4de0-8d0e-dfb8dbb099ac', 'Aditya jhavnjal ', '7796426484', 'Talegaon', 8.0000, 2, '2025-08-25', '2025-09-01 11:20:37.087');
INSERT INTO public.customers VALUES ('2561cd1c-1348-481f-88ec-c01921aa7510', 'KHOBRAGADE', '', 'BABULGAON', 7.5000, 1, '2025-08-27', '2025-09-01 11:32:12.834');
INSERT INTO public.customers VALUES ('8211157f-e8bc-4aeb-bbf3-3a78c2537d88', 'Nikhil falegaon', '', 'Falegaon', 7.7000, 1, '2025-08-28', '2025-09-01 11:27:29.631');
INSERT INTO public.customers VALUES ('c6622061-31cd-4697-9038-a4377b91c6a4', 'Mobin Akbani', '9673073399', 'Devgaon', 7.5000, 1, '2025-08-30', '2025-09-01 11:23:48.232');
INSERT INTO public.customers VALUES ('cbbe8e40-22a2-4530-93f2-e7e89ea5fc3d', 'Ramkrishna keluke', '9529482140', 'Apt', 7.3000, 2, '2025-09-01', '2025-09-01 11:24:40.817');


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--

INSERT INTO public.inventory VALUES ('ae357a51-84b1-41d8-b9b4-1e937327a7d4', 1100000, 0, '2025-09-01 11:14:02.338');


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--



--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--



--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--



--
-- Data for Name: sales_orders; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--

INSERT INTO public.sales_orders VALUES ('ab6482ef-5829-420e-88f4-0f3a696e406a', 'ORD-001', 'ffc82a7a-338b-4de0-8d0e-dfb8dbb099ac', 2500, 8.0000, 20000.00, 'tractor', 'MH27U0057', 'Manor', 'delivered', '2025-08-24', '2025-09-01', NULL, '2025-09-01 11:30:10.51', false, NULL);
INSERT INTO public.sales_orders VALUES ('e2a0fa00-1f54-405e-8e15-d1dde0a137b7', 'ORD-002', 'ffc82a7a-338b-4de0-8d0e-dfb8dbb099ac', 2500, 8.0000, 20000.00, 'tractor', 'MH27U0057', 'MANOR', 'delivered', '2025-08-25', '2025-09-01', NULL, '2025-09-01 11:31:18.43', true, NULL);
INSERT INTO public.sales_orders VALUES ('3c945b80-34d2-4fe6-84bc-743ef1af9764', 'ORD-003', '2561cd1c-1348-481f-88ec-c01921aa7510', 7000, 7.5000, 52500.00, 'truck', 'MH32Q0048', 'RAMDAS', 'delivered', '2025-08-27', '2025-09-01', NULL, '2025-09-01 11:32:53.311', false, NULL);
INSERT INTO public.sales_orders VALUES ('47917ae1-29ca-466b-aef6-d2f45de5dfa5', 'ORD-005', 'c6622061-31cd-4697-9038-a4377b91c6a4', 3000, 7.6000, 22800.00, 'tractor', 'MH27U0057', 'MANOR', 'delivered', '2025-08-30', '2025-09-01', NULL, '2025-09-01 11:35:17.683', false, NULL);
INSERT INTO public.sales_orders VALUES ('8a33068a-79db-4d5c-90bc-1c90c372eba7', 'ORD-004', '8211157f-e8bc-4aeb-bbf3-3a78c2537d88', 3000, 7.7000, 23100.00, 'tractor', 'MH27U0057', 'MANOR', 'delivered', '2025-08-28', '2025-09-01', NULL, '2025-09-01 11:34:17.604', false, NULL);
INSERT INTO public.sales_orders VALUES ('0dc2a9c7-3d79-46ec-b81d-5a08fdba0370', 'ORD-006', 'cbbe8e40-22a2-4530-93f2-e7e89ea5fc3d', 3000, 7.3000, 21900.00, 'tractor', 'MH27U0057', 'MANOR', 'delivered', '2025-09-01', '2025-09-01', NULL, '2025-09-01 11:36:13.896', false, NULL);
INSERT INTO public.sales_orders VALUES ('01fa6c1d-0127-4f60-81be-cd0baa1aa17b', 'ORD-007', 'cbbe8e40-22a2-4530-93f2-e7e89ea5fc3d', 3000, 7.3000, 21900.00, 'tractor', 'MH27U0057', 'MANOR', 'delivered', '2025-09-01', '2025-09-01', NULL, '2025-09-01 11:36:31.634', false, NULL);


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--



--
-- Data for Name: trip_participants; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--



--
-- Data for Name: weekly_summary; Type: TABLE DATA; Schema: public; Owner: kshitijgavhane
--



--
-- PostgreSQL database dump complete
--

\unrestrict gmbasqLIYQsDcSlAM5uWa57QvPreph1pxdrPcpW4nkF7sEPemQkd9icU2E8H7to

