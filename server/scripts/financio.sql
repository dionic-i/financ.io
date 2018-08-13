

CREATE TABLE public.base_classes (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    sql_text character varying(4000) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at date DEFAULT now() NOT NULL,
    description character varying(100)
);

COMMENT ON TABLE public.base_classes IS 'Таблица SQL запросов.';

CREATE SEQUENCE public.base_classes_id_class_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.base_classes_id_class_seq OWNED BY public.base_classes.id;


CREATE TABLE public.card_files (
    id integer NOT NULL,
    filename character varying(100) NOT NULL,
    original_name character varying(100) NOT NULL,
    mime_type character varying(50) NOT NULL,
    size bigint NOT NULL,
    card_id integer,
    destination character varying(300) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    is_saved smallint DEFAULT 0 NOT NULL,
    operations_count integer DEFAULT 0 NOT NULL
);

COMMENT ON COLUMN public.card_files.is_saved IS 'Сохранены транзакции или нет';
COMMENT ON COLUMN public.card_files.operations_count IS 'Количество транзакций';

CREATE TABLE public.card_types (
    id smallint NOT NULL,
    name character varying(50) NOT NULL,
    icon character varying(50)
);


CREATE TABLE public.cards (
    id integer NOT NULL,
    name character varying(20) DEFAULT 'New card'::character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    status smallint DEFAULT 1 NOT NULL,
    card_type_id smallint NOT NULL,
    user_id integer NOT NULL,
    "desc" character varying(100) DEFAULT 'My new credit card'::character varying,
    total numeric(15,2) DEFAULT (0)::numeric(15,2)
);

CREATE SEQUENCE public.cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.cards_id_seq OWNED BY public.cards.id;


CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) DEFAULT 'New category'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


CREATE SEQUENCE public.files_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.files_id_seq OWNED BY public.card_files.id;


CREATE TABLE public.patterns (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    search character varying(100) NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public.patterns OWNER TO dionic;


CREATE SEQUENCE public.patterns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patterns_id_seq OWNED BY public.patterns.id;


CREATE TABLE public.transactions (
    id integer NOT NULL,
    short character varying(100),
    "full" character varying(254),
    created_at timestamp with time zone NOT NULL,
    type integer DEFAULT 0 NOT NULL,
    amount numeric(15,4) DEFAULT 0 NOT NULL,
    card_id integer NOT NULL,
    category_id integer,
    iddate date
);


CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


CREATE TABLE public.user_settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    page character varying(100) NOT NULL,
    settings json
);


CREATE SEQUENCE public.user_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_settings_id_seq OWNED BY public.user_settings.id;


CREATE TABLE public.users (
    id integer NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    status smallint DEFAULT 1 NOT NULL,
    email character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    profile_id integer
);


CREATE TABLE public.users_categories (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL
);


CREATE SEQUENCE public.users_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_categories_id_seq OWNED BY public.users_categories.id;


CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


CREATE TABLE public.users_profile (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    firstname character varying(50),
    secondname character varying(50),
    birthday date,
    last_active timestamp without time zone DEFAULT now() NOT NULL,
    settings json,
    avatar character varying(100)
);


CREATE SEQUENCE public.users_profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_profile_id_seq OWNED BY public.users_profile.id;

ALTER TABLE ONLY public.base_classes ALTER COLUMN id SET DEFAULT nextval('public.base_classes_id_class_seq'::regclass);
ALTER TABLE ONLY public.card_files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);
ALTER TABLE ONLY public.cards ALTER COLUMN id SET DEFAULT nextval('public.cards_id_seq'::regclass);
ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);
ALTER TABLE ONLY public.patterns ALTER COLUMN id SET DEFAULT nextval('public.patterns_id_seq'::regclass);
ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);
ALTER TABLE ONLY public.user_settings ALTER COLUMN id SET DEFAULT nextval('public.user_settings_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.users_categories ALTER COLUMN id SET DEFAULT nextval('public.users_categories_id_seq'::regclass);
ALTER TABLE ONLY public.users_profile ALTER COLUMN id SET DEFAULT nextval('public.users_profile_id_seq'::regclass);

INSERT INTO public.base_classes (id, name, sql_text, version, created_at, description) VALUES (1, 'TransactionsByCategories', 'SELECT ucs.id,
       ucs.name::character varying(255),
       cg.amount
FROM 
(
	SELECT c.id,
	       c.name
	FROM categories c,
	     users_categories uc
	WHERE c.id = uc.category_id
	      AND uc.user_id=:user_id
	UNION ALL
	SELECT 0 AS id,
	       ''Не распределено'' AS name
) ucs,
(
	SELECT sum(tr.amount)::numeric(15,2) AS amount,
	       tr.category
	FROM
	(
		SELECT 
		       id,
		       amount,
		       COALESCE(category_id, 0) AS category 
		FROM transactions AS tr
		WHERE 
		card_id IN (:cards)
		AND iddate BETWEEN :begdate AND :enddate
		AND type = 0
	) tr
	GROUP BY category
) cg
WHERE ucs.id = cg.category', 1, '2018-06-27', 'Транзакции по категориям для нескольких карт');
INSERT INTO public.base_classes (id, name, sql_text, version, created_at, description) VALUES (2, 'CategoriesAmountByMonth', 'SELECT (date_part(''year'', gd.period)::character varying || date_part(''month'', gd.period)::character varying)::character varying(20) AS id,
       gd.period AS iddate, 
       tr.amount
FROM 
(
	SELECT * FROM generate_series(:begdate::timestamp, :enddate::timestamp, ''1 month'') AS period
) gd
LEFT JOIN 
(
	SELECT iddate::timestamp,
	       SUM(amount)::numeric(15,2) AS amount
	FROM 
	(
		SELECT 
		       tr.id,
		       tr.amount,	
		       COALESCE(tr.category_id, 0) AS category,
		       date_trunc(''month'', tr.iddate) AS iddate
		FROM transactions AS tr,
		     cards c 
		WHERE tr.card_id = c.id
		AND c.user_id = :user_id
		AND tr.card_id IN (:cards)
		AND tr.category_id IN (:categories)
		AND tr.iddate BETWEEN :begdate AND :enddate
	) tr

	GROUP BY iddate
) tr ON tr.iddate = gd.period
', 1, '2018-07-12', 'Сводный отчет по категориям и картам помесячно за период');
INSERT INTO public.base_classes (id, name, sql_text, version, created_at, description) VALUES (3, 'CardsAmountByMonth', 'SELECT (date_part(''year'', gd.period)::character varying || date_part(''month'', gd.period)::character varying)::character varying(20) AS id,
       gd.period AS iddate,
       tbcg.debet::numeric(15,2) AS income,
       tbcg.credit::numeric(15,2) AS outcome,
       (tbcg.debet-tbcg.credit)::numeric(15,2) As saldo
FROM 
(
	SELECT * FROM generate_series(:begdate::timestamp, :enddate::timestamp, ''1 month'') AS period
) gd
LEFT JOIN 
(
SELECT gtrg.iddate,
       SUM(gtrg.debet) AS debet,
       SUM(gtrg.credit) AS credit     
FROM 
(
		SELECT
			gtr.iddate,
			CASE type WHEN 1 THEN amount ELSE NULL END AS debet,
			CASE type WHEN 0 THEN amount ELSE NULL END AS credit
		FROM
		(
			SELECT 
			       tbc.type,
			       tbc.iddate, 
			       SUM(tbc.amount) AS amount
			FROM
			(
				SELECT 
				       tr.type,
				       date_trunc(''month'', tr.iddate)::timestamp AS iddate, 
				       tr.amount
				FROM transactions AS tr,
				     cards c
				WHERE c.id IN (:cards)
				AND c.user_id = :user_id
				AND c.id = tr.card_id
				AND tr.iddate BETWEEN :begdate AND :enddate
			) tbc
			GROUP BY iddate, type
		) gtr
	) gtrg
	GROUP BY iddate
) tbcg ON tbcg.iddate = gd.period
ORDER BY iddate
', 1, '2018-07-16', 'Отчет по балансу карт по месяцам');


SELECT pg_catalog.setval('public.base_classes_id_class_seq', 1, true);


INSERT INTO public.card_types (id, name, icon) VALUES (1, 'MasterCard', NULL);
INSERT INTO public.card_types (id, name, icon) VALUES (2, 'Visa', NULL);


SELECT pg_catalog.setval('public.transactions_id_seq', 1211, true);

SELECT pg_catalog.setval('public.user_settings_id_seq', 1, false);

INSERT INTO public.users (id, password, role, status, email, created_at, profile_id) VALUES (2, '$2a$10$DW9beNPQ/nzEyNOkJJebI.T93EBjJpblIJ1lHsz7/l11tahQmWZFi.', 'user', 1, 'admin@gmail.ru', '2018-07-18 19:13:19.251', 1);

SELECT pg_catalog.setval('public.users_categories_id_seq', 49, true);

SELECT pg_catalog.setval('public.users_id_seq', 2, true);

INSERT INTO public.users_profile (id, username, firstname, secondname, birthday, last_active, settings, avatar) VALUES (1, 'admin', 'Админ', 'Админ', '1984-12-30', '2018-08-10 16:11:55', '', '');

SELECT pg_catalog.setval('public.users_profile_id_seq', 1, true);


ALTER TABLE ONLY public.base_classes
    ADD CONSTRAINT base_classes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.card_types
    ADD CONSTRAINT card_types_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.card_files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.patterns
    ADD CONSTRAINT patterns_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users_categories
    ADD CONSTRAINT users_categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users_profile
    ADD CONSTRAINT users_profile_pkey PRIMARY KEY (id);


CREATE INDEX card_card_files_idx ON public.card_files USING btree (card_id);
CREATE INDEX transactions_id_iddate_idx ON public.transactions USING btree (id, iddate);
CREATE INDEX user_settings_fk ON public.user_settings USING btree (user_id);
CREATE INDEX users_profile_id_fk ON public.users USING btree (profile_id);


ALTER TABLE ONLY public.card_files
    ADD CONSTRAINT card_files_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id);

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_card_type_id_fkey FOREIGN KEY (card_type_id) REFERENCES public.card_types(id);

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.patterns
    ADD CONSTRAINT patterns_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id);

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.users_categories
    ADD CONSTRAINT users_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE ONLY public.users_categories
    ADD CONSTRAINT users_categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.users_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


