SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict qb5VyQtQUAONmXhkRxH7eN4mY1jXmNZNpcCTtuj6jWhUSnv2jcc6hfsHhfU9Zhh

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '8f81f993-05eb-46be-a4a5-aed4062f247e', '{"action":"login","actor_id":"11111111-1111-1111-1111-111111111111","actor_username":"test1@ucf.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-04-25 21:41:01.543045+00', '');


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'test2@ucf.edu', '$2a$06$LmAOtGXEcx7xlvrTqwX0c.zIU1LSFR8SZJym/OdpP29F98OrFlD/u', '2026-04-25 21:40:59.322994+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2026-04-25 21:40:59.322994+00', '2026-04-25 21:40:59.322994+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'test3@ucf.edu', '$2a$06$UCBNWEiaRgKBtQfDuqJxz.kmUty3QgP.h8cYrcrGMYLQ7eBpCnhTu', '2026-04-25 21:40:59.322994+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2026-04-25 21:40:59.322994+00', '2026-04-25 21:40:59.322994+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'test1@ucf.edu', '$2a$06$iIKa3yXOOVl3GUmnnvWVWeAdbfuZZea/PA0AnSgsuTA.cRfcI7kJ.', '2026-04-25 21:40:59.322994+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-25 21:41:01.544222+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2026-04-25 21:40:59.322994+00', '2026-04-25 21:41:01.548005+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub": "11111111-1111-1111-1111-111111111111", "email": "test1@ucf.edu"}', 'email', '2026-04-25 21:40:59.322994+00', '2026-04-25 21:40:59.322994+00', '2026-04-25 21:40:59.322994+00', '34dc05a6-341c-4f95-9f19-1848b6d2e935'),
	('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub": "22222222-2222-2222-2222-222222222222", "email": "test2@ucf.edu"}', 'email', '2026-04-25 21:40:59.322994+00', '2026-04-25 21:40:59.322994+00', '2026-04-25 21:40:59.322994+00', '759cd4e3-190d-481c-b000-ec362c85e715'),
	('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub": "33333333-3333-3333-3333-333333333333", "email": "test3@ucf.edu"}', 'email', '2026-04-25 21:40:59.322994+00', '2026-04-25 21:40:59.322994+00', '2026-04-25 21:40:59.322994+00', '70a99ba4-cf90-4986-bd0d-d1ab05964b31');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('432c8b0d-a6bd-4871-a629-ae9794603b4c', '11111111-1111-1111-1111-111111111111', '2026-04-25 21:41:01.544274+00', '2026-04-25 21:41:01.544274+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('432c8b0d-a6bd-4871-a629-ae9794603b4c', '2026-04-25 21:41:01.54842+00', '2026-04-25 21:41:01.54842+00', 'password', 'f19e86d9-a6d4-41c3-997e-59938834e340');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, 's4ieqjhw5ymy', '11111111-1111-1111-1111-111111111111', false, '2026-04-25 21:41:01.54621+00', '2026-04-25 21:41:01.54621+00', NULL, '432c8b0d-a6bd-4871-a629-ae9794603b4c');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profile" ("profession", "age", "about", "skill", "first_name", "user_id", "last_name", "header_pic_path", "occupation", "workplace", "articles", "banner_pic_url", "orcid", "timezone") VALUES
	(NULL, NULL, 'I am Alice Anderson, and I love math!!', '{C++,Python,"Machine Learning","Data Analysis"}', 'Alice', '11111111-1111-1111-1111-111111111111', 'Anderson', NULL, 'PhD Student', 'University of Central Florida', NULL, NULL, NULL, NULL),
	(NULL, NULL, 'I love music ', '{Other,Money,Economics}', 'Bob', '22222222-2222-2222-2222-222222222222', 'Brown', NULL, 'Postdoctoral Fellow', 'University of Central Florida', NULL, NULL, NULL, NULL),
	(NULL, NULL, NULL, NULL, 'Carol', '33333333-3333-3333-3333-333333333333', 'Carter', NULL, 'Assistant Professor', 'University of Central Florida', '[]', NULL, NULL, NULL);


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: publications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: authors_publications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."conversations" ("id", "created_at", "name", "is_group") OVERRIDING SYSTEM VALUE VALUES
	(1, '2026-04-25 21:00:00.216195+00', 'Alice''s Awesome Group', true);


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."groups" ("group_id", "name", "description", "created_at", "conversation_id", "topics", "last_activity_at", "privacy", "avatar_url", "cover_photo_url", "rules") VALUES
	(1, 'Alice''s Awesome Group', 'This is about Alice', '2026-04-25 21:00:00.216195+00', 1, '{Alice,"Machine Learning"}', '2026-04-25 21:00:16.787384+00', 'public', NULL, NULL, '');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("first_name", "last_name", "email", "created_at", "user_id", "profile_pic_path", "is_banned", "banned_at", "banned_by") VALUES
	('', '', 'test3@ucf.edu', '2026-04-25 20:54:47.267116+00', '33333333-3333-3333-3333-333333333333', NULL, false, NULL, NULL),
	('Alice', 'Anderson', 'test1@ucf.edu', '2026-04-25 20:54:47.267116+00', '11111111-1111-1111-1111-111111111111', NULL, false, NULL, NULL),
	('Bob', 'Bobberson', 'test2@ucf.edu', '2026-04-25 20:54:47.267116+00', '22222222-2222-2222-2222-222222222222', NULL, false, NULL, NULL);


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."posts" ("post_id", "category", "created_at", "text", "like_amount", "user_id", "group_id", "media_path", "scientific_field", "taken_down", "media_width", "media_height") VALUES
	(1, 'general', '2026-04-25 21:00:16.787384+00', 'I love Alice''s Group!', 0, '11111111-1111-1111-1111-111111111111', 1, NULL, 'Mathematics', false, NULL, NULL),
	(2, 'general', '2026-04-25 21:01:13.207377+00', 'This is my first math post guys! I love mathematics soooo much!', 0, '11111111-1111-1111-1111-111111111111', NULL, NULL, 'Mathematics', false, NULL, NULL),
	(3, 'general', '2026-04-25 21:03:51.048545+00', 'Grr, why is this math problem so dang hard?!?!', 0, '11111111-1111-1111-1111-111111111111', NULL, '11111111-1111-1111-1111-111111111111/6c0d7e9f-5a0a-4b89-88de-e83c4445915d.jpg', 'Mathematics', false, 1274, 1801),
	(4, 'general', '2026-04-25 21:18:30.549348+00', 'Math is the sun', 0, '11111111-1111-1111-1111-111111111111', NULL, '11111111-1111-1111-1111-111111111111/7d9b1b5a-75e6-4305-852d-7d2354f59268.jpg', 'Mathematics', false, 5000, 2619);


--
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: comment_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."conversation_participants" ("conversation_id", "user_id", "joined_at") VALUES
	(1, '11111111-1111-1111-1111-111111111111', '2026-04-25 21:00:00.216195+00');


--
-- Data for Name: conversation_reads; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: feed_report; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: group_bans; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: group_join_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."group_members" ("group_id", "role", "created_at", "user_id") VALUES
	(1, 'Admin', '2026-04-25 21:00:00.216195+00', '11111111-1111-1111-1111-111111111111');


--
-- Data for Name: invites; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jobs_applicants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jobs_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jobs_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: moderators; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: muted_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profile_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profile_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profile_tags_temp; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: publication_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_products; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_publications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_report; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, true);


--
-- Name: Articles_articleid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."Articles_articleid_seq"', 1, false);


--
-- Name: Comment_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."Comment_comment_id_seq"', 1, false);


--
-- Name: Comment_likes_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."Comment_likes_comment_id_seq"', 1, false);


--
-- Name: Comment_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."Comment_post_id_seq"', 1, false);


--
-- Name: FeedReport_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."FeedReport_report_id_seq"', 1, false);


--
-- Name: Groups_groupid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."Groups_groupid_seq"', 1, true);


--
-- Name: Posts_postid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."Posts_postid_seq"', 4, true);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."conversations_id_seq"', 1, true);


--
-- Name: group_join_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."group_join_requests_request_id_seq"', 1, false);


--
-- Name: group_members_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."group_members_group_id_seq"', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."jobs_id_seq"', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."messages_id_seq"', 1, false);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."products_product_id_seq"', 1, false);


--
-- Name: publications_publication_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."publications_publication_id_seq"', 1, false);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."skills_id_seq"', 1, false);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."tags_id_seq"', 1, false);


--
-- Name: user_report_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."user_report_report_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict qb5VyQtQUAONmXhkRxH7eN4mY1jXmNZNpcCTtuj6jWhUSnv2jcc6hfsHhfU9Zhh

RESET ALL;
