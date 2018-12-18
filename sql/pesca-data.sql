--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.1
-- Dumped by pg_dump version 9.6.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = pesca, pg_catalog;

--
-- Data for Name: checks; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY checks (check_id, check_desc, check_order, check_subject) FROM stdin;
1	Termo de Responsabilidade	1	vessel
2	Comprovante de Pagamento de Taxa	2	vessel
3	Cópia do TIE da Embarcação	3	vessel
4	Comprovante de Pagamento de Taxa	4	vessel
5	Original da PPP	5	vessel
6	Comprovante de Pagamento de Taxa (se acima de 8m)	6	vessel
7	RG do Armador	1	client
8	CPF ou CNPJ do Armador	2	client
9	Comprovante de Residência	3	client
10	Comprovante de Pagamento de Taxa	4	client
11	Certificado de Armador (Se AB > 100)	5	client
12	Nada Consta do IBAMA	6	client
\.


--
-- Data for Name: fishingtypes; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY fishingtypes (fishingtype_id, fishingtype_desc) FROM stdin;
1	Vara e Isca Viva
2	Iscador Automático
3	Espinhel Vertical
4	Armadilha
5	Rede de Cerco (Sardinha)
7	Rede de Cerco (Bonito)
8	Espinhel de Superfície
9	Espinhel de Fundo
10	Rede de Emalhar de Superfície
12	Arrasto (Peixes Demersais)
11	Arrasto (Camarões)
6	Espinhel Vertical (Pargo)
\.


--
-- Data for Name: fishes; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY fishes (fish_id, fish_name, fishingtype_id) FROM stdin;
1	Abrótea	4
2	Ariacó	4
3	Badejo / Sirigado	4
4	Bagre	4
5	Batata	4
6	Batata-da-pedra	4
7	Besugo	4
8	Bijupirá	4
9	Biquara / Corcoroca / Pirambú	4
10	Budião	4
11	Cação bagre	4
12	Cação gato	4
13	Caranguejo aranha	4
14	Caranguejo real	4
15	Caranguejo vermelho	4
16	Caranha	4
17	Carapitanga / Paramirim / Realito	4
18	Caraúna / Cirurgião	4
19	Cherne galha-amarela	4
20	Cherne listrado	4
21	Cherne poveiro	4
22	Cherne queimado	4
23	Cherne verdadeiro	4
24	Cioba / Sirioba	4
25	Congro	4
26	Congro negro	4
27	Congro rosa	4
28	Dentão / Baúna	4
29	Garoupa gato	4
30	Garoupa verdadeira	4
31	Garoupa vermelha / São-Tomé	4
32	Gostosa / Piranema	4
33	Guaiúba / rabo-amarelo	4
34	Jaguariçá	4
35	Lagosta pintada	4
36	Lagosta sapateira	4
37	Lagosta verde	4
38	Lagosta vermelha	4
39	Mariquita	4
40	Moréia	4
41	Namorado	4
42	Olho-de-cão	4
43	Pargo boca-preta / Sassupema	4
44	Pargo olho-amarelo	4
45	Pargo olhudo	4
46	Pargo rosa	4
47	Pargo verdadeiro	4
48	Peixe pena	4
49	Peixe porco / Peroá / Cangulo	4
50	Piraúna / Catuá / Jabú	4
51	Polvo	4
52	Salema	4
53	Saramunete	4
54	Sarrão 	4
55	Trilha	4
56	Abrótea	11
57	Bagre	11
58	Batata	11
59	Cabrinha	11
60	Cação anjo	11
61	Cação bagre	11
62	Cação bico-doce	11
63	Cação cola-fina	11
64	Cação mangona	11
65	Calamar	11
66	Camarão Barab-Ruça / Ferrinho	11
67	Camarão Branco / Legítimo	11
68	Camarão Carabineiro	11
69	Camarão Rosa	11
70	Camarão Sete Barbas	11
71	Camarão vermelho / Santana	11
72	Caranguejo real 	11
73	Caranguejo vermelho	11
74	Castanha	11
75	Congro	11
76	Congro rosa	11
77	Corvina	11
78	Linguado	11
79	Lula	11
80	Merluza	11
81	Palombeta	11
82	Pargo rosa	11
83	Peixe porco / Peroá	11
84	Peixe-sapo	11
85	Pescada amarela	11
86	Pescada branca	11
87	Pescada cambucu	11
88	Pescada foguete	11
89	Pescada gó	11
90	Pescada goete	11
91	Pescada olhuda / Maria-mole	11
92	Pescadinha	11
93	Pescadinha real	11
94	Polvo	11
95	Raia emplasto	11
96	Trilha	11
97	Viola	11
98	Abrótea	9
99	Abrótea-do-fundo	9
100	Badejo	9
101	Barracuda	9
102	Batata	9
103	Batata-da-pedra	9
104	Cabrinha	9
105	Cação anjo	9
106	Cação bagre	9
107	Cação bico-doce	9
108	Cação frango	9
109	Cação-de-espinho	9
110	Cação machote	9
111	Cação mangona	9
112	Cavala	9
113	Catuá / Garoupinha	9
114	Cherne verdadeiro	9
115	Cherne galha-amarela	9
116	Cherne queimado	9
117	Cherne listrado	9
118	Cherne poveiro	9
119	Cioba / Sirioba	9
120	Congro	9
121	Congro rosa	9
122	Corvina	9
123	Dentão	9
124	Dourado	9
125	Garoupa verdadeira	9
126	Garoupa vermelha / São-Tomé	9
127	Guaiúba / rabo-amarelo	9
128	Lírio	9
129	Merluza	9
130	Mero	9
131	Namorado	9
132	Olhete / Pitangola	9
133	Olho-de-boi	9
134	Olho-de-cão	9
135	Pargo verdadeiro	9
136	Pargo rosa	9
137	Peixe pena	9
138	Peixe porco / Peroá / Cangulo	9
139	Raia	9
140	Vermelho	9
141	Vermelho olho-amarelo	9
142	Viola	9
143	Sarrão	9
144	Xaréu / Xarelete / Carapau	9
145	Abrótea	3
146	Abrótea-do-fundo	3
147	Badejo quadrado	3
148	Badejo mira	3
149	Barracuda	3
150	Bicuda	3
151	Batata	3
152	Batata-da-pedra	3
153	Bonito pintado	3
154	Cação anequim / moro	3
155	Cação anjo	3
156	Cação azul / mole-mole	3
157	Cação bagre	3
158	Cação bico-doce	3
159	Cação cabeça-chata	3
160	Cação cola-fina	3
161	Cação-de-espinho	3
162	Cação frango	3
163	Cação martelo	3
164	Cação machote	3
165	Cação mangona	3
166	Cação viola	3
167	Caranha	3
168	Catuá / Garoupinha	3
169	Cavala	3
170	Cavala empinge	3
171	Cherne verdadeiro	3
172	Cherne galha amarela	3
173	Cherne queimado	3
174	Cherne listrado	3
175	Cherne poveiro	3
176	Cioba	3
177	Congro	3
178	Congro	3
179	Dentão	3
180	Dourado	3
181	Enchova	3
182	Espada	3
183	Garoupa verdadeira	3
184	Garoupa São-Tomé	3
185	Guaiúba	3
186	Lírio	3
187	Mero	3
188	Namorado	3
189	Olho-de-boi	3
190	Olhete / Pitangola	3
191	Pargo rosa	3
192	Peixe porco / Peroá	3
193	Raia	3
194	Realito	3
195	Sarrão	3
196	Vermelho	3
197	Xaréu	3
198	Xarelete / Carapau	3
199	Albacora-bandolim (BET)	7
200	Albacora-branca (ALB)	7
201	Albacora laje (YFT)	7
202	Albacorinha (BLF)	7
203	Bicuda	7
204	Bonito Cachorro	7
205	Bonito Listrado	7
206	Bonito Pintado	7
207	Cavala	7
208	Cavala Empinge (W AH)	7
209	Dourado (DOL)	7
210	Albacora-bandolim (BET)	1
211	Albacora-branca (ALB)	1
212	Albacora-laje (YFT)	1
213	Albacorinha (BLF)	1
214	Bonito-cachorro	1
215	Bonito-listrado (SKJ)	1
216	Bonito-pintado	1
217	Cavala	1
218	Cavala-empinge (W AH)	1
219	Dourado (DOL)	1
220	Anchoíta	5
221	Bicuda	5
222	Bonito cachorro	5
223	Bonito pintado	5
224	Carapau	5
225	Cavalinha	5
226	Corvina	5
227	Dourado	5
228	Enchova	5
229	Espada	5
230	Peixe	5
231	Galo	5
232	Goete	5
233	Gordinho	5
234	Palombeta	5
235	Pescada	5
236	Pescadinha	5
237	Sarda	5
238	Sardinha boca-torta	5
239	Sardinha cascuda	5
240	Sardinha laje	5
241	Sardinha verdadeira	5
242	Savelha	5
243	Serra/Sororoca	5
244	Tainha	5
245	Xaréu	5
246	Xerelete	5
247	Xixarro	5
248	Cação galha-branca	10
249	Cação galha-preta	10
250	Cação galhudo	10
251	Cação lombo preto	10
252	Cação machote	10
253	Cação mangona	10
254	Cação martelo	10
255	Cação martelo-liso	10
256	Cação tigre / Tintureiro	10
257	Cavala	10
258	Cavala empinge	10
259	Dourado	10
260	Espadarte / Meca	10
261	Olho-de-boi / Arabaiana	10
262	Peixe lua	10
263	Peixe prego	10
264	Raia lixa	10
265	Raia manteiga	10
266	Raia chita	10
267	Raia manta	10
268	Sarda	10
269	Serra / Sororoca	10
270	Xaréu	10
271	Agulhão branco (WHM)	8
272	Agulhão negro (BUM)	8
273	Agulhão vela (SAI)	8
274	Albacora Azul (BFT)	8
275	Albacora bandolim (BET)	8
276	Albacora branca (ALB)	8
277	Albacora laje (YFT)	8
278	Albacorinha (BLF)	8
279	Arraia jamanta	8
280	Barracuda	8
281	Cavala empinge (W AH)	8
282	Cavala preta	8
283	Dourado (DOL)	8
284	Espadarte (SWO)	8
285	Peixe prego	8
286	Tubarão azul (BSH)	8
287	Tubarão cachorro	8
288	Tubarão lombo preto (FAL)	8
289	Tubarão mako / anequim (MAK)	8
290	Tubarão martelo(SPX)	8
291	Tubarão raposa (BTH)	8
292	Tubarão tigre	8
293	Calamar argentino	2
294	Lula comum	2
295	Outras	2
296	Arabaiana	6
297	Aracanguira	6
298	Ariacó	6
299	Sirigado	6
300	Barracuda / Goirana	6
301	Batata	6
302	Batata-da-pedra	6
303	Biquara / Pirambú	6
304	Bijupirá	6
305	Cação / Tubarão	6
306	Cação martelo	6
307	Cangulo / Peroá	6
308	Caranha	6
309	Carapitanga / Paramirim	6
310	Cavala	6
311	Cavala empinge	6
312	Cioba / Sirioba	6
313	Corvina	6
314	Cherne verdadeiro	6
315	Cherne galha-amarela	6
316	Cherne queimado	6
317	Cherne listrado	6
318	Dentão	6
319	Dourado	6
320	Graçarim / Guaracimbora	6
321	Garoupa	6
322	Garoupa gato	6
323	Gostosa / Piranema	6
324	Guaiúba / rabo-amarelo	6
325	Guaricema / Guarassuma	6
326	Guarajuba	6
327	Gurijuba	6
328	Mero / Canapú	6
329	Olho-de-boi	6
330	Pargo verdadeiro	6
331	Pargo olho-amarelo	6
332	Pargo boca-preta / Sassupema	6
333	Pargo olhudo	6
334	Peixe pena	6
335	Pescada Amarela	6
336	Pirá	6
337	Piraúna / Jabú / Catuá	6
338	Raia	6
339	Xaréu	6
340	Xaréu preto	6
341	Abrótea	12
342	Bagre	12
343	Baiacu	12
344	Batata	12
345	Batata-da-Pedra	12
346	Betara / Papa-terra	12
347	Cabrinha	12
348	Cação bagre	12
349	Cação bico-doce	12
350	Cação cola-fina	12
351	Cação mangona	12
352	Cação anjo	12
353	Calamar argentino	12
354	Camarão barba-ruça / ferrinho	12
355	Camarão branco / legítimo	12
356	Camarão carabineiro	12
357	Camarão rosa	12
358	Camarão sete barbas	12
359	Camarão vermelho / Santana	12
360	Caranguejo real	12
361	Caranguejo vermelho	12
362	Castanha	12
363	Cavalinha	12
364	Cherne-poveiro	12
365	Cherne-verdadeiro	12
366	Cherne galha-amarela	12
367	Congro-rosa	12
368	Corvina	12
369	Espada	12
370	Galo	12
371	Garoupa	12
372	Goete	12
373	Guaivira	12
374	Linguado	12
375	Lula	12
376	Merluza	12
377	Namorado	12
378	Pargo rosa	12
379	Peixe-porco / Peroá	12
380	Peixe-sapo	12
381	Pescada amarela	12
382	Pescada branca	12
383	Pescada cambucu	12
384	Pescada foguete	12
385	Pescada olhuda/Maria-mole	12
386	Pescadinha real	12
387	Polvo	12
388	Raias	12
389	Roncador	12
390	Sarrão	12
391	Trilha	12
392	Viola	12
393	Xixarro	12
\.


--
-- Name: fishes_fish_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('fishes_fish_id_seq', 393, true);


--
-- Name: fishingtypes_fishingtype_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('fishingtypes_fishingtype_id_seq', 12, true);


--
-- Data for Name: geometries; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY geometries (geometry_id, geometry_name, client_id, entities, dimensions, geometry_type, geom_geojson, geom_4326) FROM stdin;
1	Fortaleza	2	1	2	POLYGON	{"type":"Polygon","coordinates":[[[-38.5771926555042,-3.63216309234329],[-38.6375763033695,-3.73968357478121],[-38.4671650143156,-3.84715507279617],[-38.4075706951805,-3.70991952368923],[-38.5771926555042,-3.63216309234329]]]}	0103000020E61000000100000005000000E070ED72E14943C03ED2FA85AB0E0DC09DD6AD199C5143C0D696D838DFEA0DC013292D10CC3B43C07866223DF9C60EC0DF4DCB462B3443C00A4C8849EAAD0DC0E070ED72E14943C03ED2FA85AB0E0DC0
2	Itarema	2	1	2	POLYGON	{"type":"Polygon","coordinates":[[[-39.987857510221,-2.81770134790529],[-40.0161952307567,-2.8752806045151],[-39.8463328070649,-2.94800191901816],[-39.8231756631891,-2.89263195022402],[-39.987857510221,-2.81770134790529]]]}	0103000020E61000000100000005000000E8C0691D72FE43C0C82F1901A78A06C0BE3971AF120244C04AB9191E930007C01AF027A254EC43C073D3B507829507C05021F4D15DE943C0779D4C381C2407C0E8C0691D72FE43C0C82F1901A78A06C0
\.


--
-- Name: geometries_geometry_id_seq; Type: SEQUENCE SET; Schema: pesca; Owner: inkas
--

SELECT pg_catalog.setval('geometries_geometry_id_seq', 1, false);


--
-- Data for Name: winddir; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY winddir (winddir_id, winddir_desc) FROM stdin;
0	N
1	NE
2	E
3	SE
4	S
5	SW
6	W
7	NW
\.


--
-- Data for Name: winds; Type: TABLE DATA; Schema: pesca; Owner: inkas
--

COPY winds (wind_id, wind_desc) FROM stdin;
0	Calmo
1	Aragem
2	Brisa Leve
3	Brisa Fraca
4	Brisa Moderada
5	Brisa Forte
6	Vento Fresco
7	Vento Forte
8	Ventania
9	Ventania Forte
10	Tempestade
11	Tempestade Violenta
12	Furação
\.


--
-- PostgreSQL database dump complete
--

