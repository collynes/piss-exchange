-- ============================================================
-- BATALO PHARMA SEED — Generated from batalophama MySQL dump
-- ============================================================

-- Clear placeholder seed drugs from migration
DELETE FROM market_data;
DELETE FROM drugs;

-- Create Batalo Pharma auth user
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new,
  email_change, phone_change, phone_change_token, email_change_token_current, reauthentication_token
) VALUES (
  'ba7a1000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@batalophama.co.ke',
  crypt('Batalo@2024!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"org_name":"Batalo Pharma"}',
  now(), now(), '', '', '',
  '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Create Batalo Pharma profile (admin + seller, pre-verified)
INSERT INTO profiles (id, role, org_name, phone, verified, country_id)
SELECT
  'ba7a1000-0000-0000-0000-000000000001', 'seller', 'Batalo Pharma', '+254700000001', true,
  id FROM countries WHERE code = 'KE'
ON CONFLICT (id) DO NOTHING;

-- Insert unique drug generics
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '44145b08-7e27-45de-aac5-901b2964963c', 'Ciprofloxacin', 'ciprofloxacin-0-3-eye-ear-drops', 'Eye/Ear Drops', '0.3%', 'Ophthalmological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '22d47ea7-15c2-4361-8c9c-91071da91eae', 'Ibuprofen', 'ibuprofen-200mg-tablet', 'Tablet', '200mg', 'Analgesics & NSAIDs',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'e1d873fd-2b18-4753-90ef-3422b6e0df9f', 'Ibuprofen', 'ibuprofen-100mg-5ml-syrup', 'Syrup', '100mg/5ml', 'Analgesics & NSAIDs',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '544b9719-9729-4aea-9d8a-f4a710d9622a', 'Paracetamol', 'paracetamol-120mg-5ml-syrup', 'Syrup', '120mg/5ml', 'Analgesics & NSAIDs',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'b7e37b26-f625-4325-9f27-18e7f028ac08', 'Ursodeoxycholic Acid', 'ursodeoxycholic-acid-300mg-tablet', 'Tablet', '300mg', 'Gastrointestinal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '8a04c418-8460-45b6-8f47-2d5b5d7ae48d', 'Diclofenac Sodium', 'diclofenac-sodium-25mg-ml-injection', 'Injection', '25mg/ml', 'Analgesics & NSAIDs',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '76e91f1f-d953-4cf2-bea2-5d2a9e560214', 'Miconazole', 'miconazole-20mg-g-oral-gel', 'Oral Gel', '20mg/g', 'Antifungals',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '5a7b3750-2c33-4d61-9e6b-ce56161a8d64', 'Tamoxifen', 'tamoxifen-20mg-tablet', 'Tablet', '20mg', 'Oncology',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '96768755-2de5-43cc-a003-c26d3ad7869b', 'Allopurinol', 'allopurinol-100mg-tablet', 'Tablet', '100mg', 'Musculoskeletal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '82b28583-46cd-47f7-9d4e-0bdb7d4481d6', 'Mometasone Furoate', 'mometasone-furoate-0-1-cream', 'Cream', '0.1%', 'Dermatological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '06c3e20e-435c-4712-adc8-635be76863ab', 'Sodium Chloride 0.9%', 'sodium-chloride-0-9-0-9-infusion', 'Infusion', '0.9%', 'Intravenous Fluids',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '2d53a40b-9532-401c-afc2-55c0de25a971', 'Methylcobalamin / B-Complex', 'methylcobalamin-b-complex-500mcg-capsule', 'Capsule', '500mcg', 'Nutritional Supplements',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'ce619f61-b156-4ca6-908e-ee6505e5db11', 'Esomeprazole', 'esomeprazole-20mg-tablet', 'Tablet', '20mg', 'Gastrointestinal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '9e2acff7-efbb-4035-a568-d3b9d69f757b', 'Ketoconazole', 'ketoconazole-2-shampoo', 'Shampoo', '2%', 'Dermatological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '43fe9a5a-6689-4970-be63-a09565211182', 'Mupirocin', 'mupirocin-2-ointment', 'Ointment', '2%', 'Dermatological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '19903da2-134b-458a-8fdc-f074fcec030e', 'Calamine', 'calamine-15-lotion', 'Lotion', '15%', 'Dermatological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '24095dda-7759-4ead-a384-33210b7f9f9c', 'Bromhexine / Guaifenesin', 'bromhexine-guaifenesin-4mg-100mg-per-5ml-syrup', 'Syrup', '4mg/100mg per 5ml', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'bc7275a4-6d8b-4368-abd2-3fd0096d00ff', 'Dextromethorphan / Guaifenesin', 'dextromethorphan-guaifenesin-10mg-100mg-per-5ml-syrup', 'Syrup', '10mg/100mg per 5ml', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '609c9c21-72b8-40ae-9592-c8fe1c960106', 'Bromhexine / Paracetamol', 'bromhexine-paracetamol-2mg-125mg-per-5ml-syrup', 'Syrup', '2mg/125mg per 5ml', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '9e9c5fbb-b225-4d8c-bf5e-693cd615f4fd', 'Iron / Vitamin B12', 'iron-vitamin-b12-150mg-15mcg-per-5ml-syrup', 'Syrup', '150mg/15mcg per 5ml', 'Nutritional Supplements',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '9b3ef320-2012-48bf-835b-a944a7c5df9d', 'Betahistine', 'betahistine-8mg-tablet', 'Tablet', '8mg', 'Neurological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '539c68f6-3336-454f-aec1-99bf216ee3bb', 'Rosuvastatin / Ezetimibe', 'rosuvastatin-ezetimibe-20mg-10mg-tablet', 'Tablet', '20mg/10mg', 'Cardiovascular',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '07a56a2f-84e1-41f6-964e-5c6ce2975ffc', 'Salbutamol Sulphate', 'salbutamol-sulphate-100mcg-dose-inhaler', 'Inhaler', '100mcg/dose', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'cd910b67-f52f-4f09-9a8b-9363d7f3ffd9', 'Azithromycin', 'azithromycin-500mg-tablet', 'Tablet', '500mg', 'Antibiotics',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '16047ce2-242c-4649-882d-6a36b18618f7', 'Omeprazole', 'omeprazole-20mg-capsule', 'Capsule', '20mg', 'Gastrointestinal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'e94dd79f-7b09-476a-85e2-3b2c405fc0ad', 'Ezetimibe', 'ezetimibe-10mg-tablet', 'Tablet', '10mg', 'Cardiovascular',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'c5007c3f-9aea-42bf-890f-e5320d0f6037', 'Isosorbide Mononitrate', 'isosorbide-mononitrate-10mg-tablet', 'Tablet', '10mg', 'Cardiovascular',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'add3dd62-9281-40af-8d39-3232ecf4ea4d', 'Mometasone / Olopatadine', 'mometasone-olopatadine-25mcg-665mcg-per-dose-nasal-spray', 'Nasal Spray', '25mcg/665mcg per dose', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '22961e12-1e39-498a-96e1-85b9df7e6ecf', 'Acetylcysteine', 'acetylcysteine-600mg-effervescent-tablet', 'Effervescent Tablet', '600mg', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '039ca553-3708-4e2d-ab7f-119589cd5764', 'Risperidone', 'risperidone-2mg-tablet', 'Tablet', '2mg', 'Mental Health',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '129a2934-3b3b-4e58-a490-3d2d5026717a', 'Mebeverine', 'mebeverine-200mg-capsule', 'Capsule', '200mg', 'Gastrointestinal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'f9c76f0e-6f2c-4df1-94ab-d5e4b24abba3', 'Theophylline / Etofylline', 'theophylline-etofylline-300mg-tablet-sr', 'Tablet SR', '300mg', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '6b50befe-8440-4d07-a457-5249ecb34f41', 'Cilnidipine / Telmisartan', 'cilnidipine-telmisartan-20mg-80mg-tablet', 'Tablet', '20mg/80mg', 'Cardiovascular',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '664c0d70-773a-47bd-835a-f1d0b28f9dfb', 'Diazepam', 'diazepam-5mg-tablet', 'Tablet', '5mg', 'Mental Health',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '119bab4c-c015-4839-abc8-f7a7e185be8e', 'Erythromycin', 'erythromycin-500mg-tablet', 'Tablet', '500mg', 'Antibiotics',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '3ea046aa-9a5e-4733-86a7-d36c7353e35c', 'Itraconazole', 'itraconazole-100mg-capsule', 'Capsule', '100mg', 'Antifungals',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'd4f03ec6-81fc-46ed-a8bf-b68479abe24d', 'Chlorphenamine / Dextromethorphan', 'chlorphenamine-dextromethorphan-2mg-10mg-per-5ml-syrup', 'Syrup', '2mg/10mg per 5ml', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '7ebf8579-e61b-4bc3-a4b3-b753bd1d617f', 'Propranolol', 'propranolol-40mg-tablet', 'Tablet', '40mg', 'Cardiovascular',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '63926684-b6b5-44ce-af5a-ca6be0ec7234', 'Potassium Chloride', 'potassium-chloride-600mg-tablet-sr', 'Tablet SR', '600mg', 'Electrolytes',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'c2d811ea-400b-4f3e-aa3f-bedb9df91543', 'Eflornithine', 'eflornithine-13-9-cream', 'Cream', '13.9%', 'Dermatological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '250499e2-b1e9-41d5-af8a-f05edd194ffd', 'Calcium Carbonate / Vitamin D3', 'calcium-carbonate-vitamin-d3-500mg-200iu-tablet', 'Tablet', '500mg/200IU', 'Nutritional Supplements',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'f88b0446-1375-4c38-9572-15be5cf59f5d', 'Empagliflozin', 'empagliflozin-25mg-tablet', 'Tablet', '25mg', 'Diabetes',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '5db4e9bf-72d5-4793-8e8b-ccdae3d6884a', 'Metoclopramide', 'metoclopramide-10mg-2ml-injection', 'Injection', '10mg/2ml', 'Gastrointestinal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '2fba9667-d629-4212-b368-46221e530b06', 'Cetirizine / Paracetamol', 'cetirizine-paracetamol-10mg-500mg-tablet', 'Tablet', '10mg/500mg', 'Analgesics & NSAIDs',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'aa4bf00e-7da5-4dee-9ae5-159c23715238', 'Salbutamol / Bromhexine / Guaifenesin', 'salbutamol-bromhexine-guaifenesin-1mg-2mg-50mg-per-5ml-syrup', 'Syrup', '1mg/2mg/50mg per 5ml', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '2c47e0e3-4623-4b1a-a567-2de50e36480f', 'Metronidazole', 'metronidazole-200mg-5ml-suspension', 'Suspension', '200mg/5ml', 'Antibiotics',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'dff85029-1a52-461f-b522-0a2acbf756ca', 'Paracetamol / Chlorphenamine', 'paracetamol-chlorphenamine-125mg-1mg-per-5ml-syrup', 'Syrup', '125mg/1mg per 5ml', 'Analgesics & NSAIDs',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'acff1a12-53ec-4efc-996d-bc4c5044a54e', 'Mefenamic Acid', 'mefenamic-acid-500mg-capsule', 'Capsule', '500mg', 'Analgesics & NSAIDs',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '61e82a0a-b77a-4e68-8ff9-d6d2437e6fbc', 'Ubidecarenone / L-Carnitine', 'ubidecarenone-l-carnitine-30mg-500mg-tablet', 'Tablet', '30mg/500mg', 'Cardiovascular',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '04e93b95-904c-4ce2-a4a4-2e13e47d7510', 'Clobazam', 'clobazam-10mg-tablet', 'Tablet', '10mg', 'Mental Health',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'cff150ad-1553-42a6-827d-7bd0f5827449', 'Montelukast / Levocetirizine', 'montelukast-levocetirizine-10mg-5mg-tablet', 'Tablet', '10mg/5mg', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'b96035a3-a2bc-4c68-9d47-48296e4235ab', 'Mirabegron', 'mirabegron-50mg-tablet', 'Tablet', '50mg', 'Urology',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '724b3192-883b-4b07-b7b1-a5ca87f3dd5b', 'Montelukast', 'montelukast-10mg-tablet', 'Tablet', '10mg', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'ec700c7d-54a8-47f6-b8ff-c80b6a91fb18', 'Methylphenidate', 'methylphenidate-18mg-tablet-sr', 'Tablet SR', '18mg', 'Mental Health',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'c6faca0f-df7e-4c71-926b-7eeaddf35c48', 'Glucosamine / Diacerhein', 'glucosamine-diacerhein-500mg-50mg-tablet', 'Tablet', '500mg/50mg', 'Musculoskeletal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '6a21d363-5fdf-4b64-ab60-38b1e7a670b3', 'Vonoprazan', 'vonoprazan-20mg-tablet', 'Tablet', '20mg', 'Gastrointestinal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '62ef9e70-7817-4a3b-b0a7-08b1c5a426ed', 'Chloramphenicol / Clotrimazole', 'chloramphenicol-clotrimazole-0-5-1-ear-drops', 'Ear Drops', '0.5%/1%', 'Ophthalmological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '36c75dc3-b49d-4ef5-99ec-11c2e45c8663', 'Cetirizine / Ambroxol', 'cetirizine-ambroxol-2-5mg-15mg-per-5ml-syrup', 'Syrup', '2.5mg/15mg per 5ml', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '3e8408ca-cad6-4038-b781-6875c196f0ec', 'Phenobarbitone', 'phenobarbitone-30mg-tablet', 'Tablet', '30mg', 'Mental Health',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'f549e76f-7c47-4ef3-9fe6-7c62496ef378', 'Terbinafine', 'terbinafine-1-cream', 'Cream', '1%', 'Antifungals',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '17ca1d7a-96b7-4022-8020-3303538a58b4', 'Chlorphenamine / Guaifenesin', 'chlorphenamine-guaifenesin-2mg-100mg-per-5ml-syrup', 'Syrup', '2mg/100mg per 5ml', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '2e1794d2-1dbe-4d82-9aa2-861bfd80c735', 'Tramadol', 'tramadol-50mg-capsule', 'Capsule', '50mg', 'Analgesics & NSAIDs',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'e8685455-2234-42d2-977d-f9b03f1e0466', 'Ofloxacin', 'ofloxacin-50mg-5ml-suspension', 'Suspension', '50mg/5ml', 'Antibiotics',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '850e019c-cf74-4510-b29c-37ca3c9c2c45', 'Paromomycin', 'paromomycin-250mg-tablet', 'Tablet', '250mg', 'Antibiotics',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '6d975395-c9a4-4204-ba92-24ccf97fb14c', 'Dexamethasone / Chloramphenicol', 'dexamethasone-chloramphenicol-0-1-0-5-eye-ear-drops', 'Eye/Ear Drops', '0.1%/0.5%', 'Ophthalmological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '9715034d-10c1-453b-8b7b-e4651e53879d', 'Fusidic Acid', 'fusidic-acid-2-solution', 'Solution', '2%', 'Dermatological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '64e379c6-ab4a-4a22-8620-7f9c57611a74', 'Bimatoprost', 'bimatoprost-0-01-eye-drops', 'Eye Drops', '0.01%', 'Ophthalmological',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'bab2b083-f79e-48cc-82c5-02bd3e749fae', 'Febuxostat', 'febuxostat-40mg-tablet', 'Tablet', '40mg', 'Musculoskeletal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '829a8740-a32c-4dfa-860c-687d80736542', 'Febuxostat', 'febuxostat-80mg-tablet', 'Tablet', '80mg', 'Musculoskeletal',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT '39d94088-22ba-47d5-95cb-83386bd68f4f', 'Methylcobalamin / Alpha Lipoic Acid', 'methylcobalamin-alpha-lipoic-acid-500mcg-100mg-softgel', 'Softgel', '500mcg/100mg', 'Nutritional Supplements',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO drugs (id, generic_name, slug, dosage_form, strength, category, country_id, active)
SELECT 'bbacd2a6-1107-40ec-96de-d60bf5959084', 'Formoterol / Fluticasone', 'formoterol-fluticasone-250mcg-6mcg-per-dose-inhaler', 'Inhaler', '250mcg/6mcg per dose', 'Respiratory',
  id, true FROM countries WHERE code = 'KE'
ON CONFLICT (slug) DO NOTHING;

-- Initialise market_data for all drugs
INSERT INTO market_data (drug_id)
SELECT id FROM drugs
ON CONFLICT (drug_id) DO NOTHING;

-- Insert Batalo Pharma listings (asks)
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('44145b08-7e27-45de-aac5-901b2964963c', 'ba7a1000-0000-0000-0000-000000000001', 'Ciproken', 'Batalo Pharma', 'Kenya',
  200, 200, 121.54, 10, '4H00777', '2027-07-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('22d47ea7-15c2-4361-8c9c-91071da91eae', 'ba7a1000-0000-0000-0000-000000000001', 'Ibuprofen', 'Batalo Pharma', 'Kenya',
  200, 200, 5.0, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('e1d873fd-2b18-4753-90ef-3422b6e0df9f', 'ba7a1000-0000-0000-0000-000000000001', 'Daprofen', 'Batalo Pharma', 'Kenya',
  200, 200, 70.0, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('e1d873fd-2b18-4753-90ef-3422b6e0df9f', 'ba7a1000-0000-0000-0000-000000000001', 'Daprofen', 'Batalo Pharma', 'Kenya',
  200, 200, 100.0, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('544b9719-9729-4aea-9d8a-f4a710d9622a', 'ba7a1000-0000-0000-0000-000000000001', 'Curamol', 'Batalo Pharma', 'Kenya',
  200, 200, 70.0, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('544b9719-9729-4aea-9d8a-f4a710d9622a', 'ba7a1000-0000-0000-0000-000000000001', 'Pamol', 'Batalo Pharma', 'Kenya',
  200, 200, 70.0, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('b7e37b26-f625-4325-9f27-18e7f028ac08', 'ba7a1000-0000-0000-0000-000000000001', 'Udihep', 'Batalo Pharma', 'Kenya',
  200, 200, 110.0, 10, NULL, '2026-12-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('8a04c418-8460-45b6-8f47-2d5b5d7ae48d', 'ba7a1000-0000-0000-0000-000000000001', 'Diclofenac', 'Batalo Pharma', 'Kenya',
  200, 200, 50.0, 10, NULL, '2027-12-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('76e91f1f-d953-4cf2-bea2-5d2a9e560214', 'ba7a1000-0000-0000-0000-000000000001', 'Daktarin', 'Batalo Pharma', 'Kenya',
  200, 200, 800.0, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('5a7b3750-2c33-4d61-9e6b-ce56161a8d64', 'ba7a1000-0000-0000-0000-000000000001', 'Tamoxifen', 'Batalo Pharma', 'Kenya',
  200, 200, 900.0, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('96768755-2de5-43cc-a003-c26d3ad7869b', 'ba7a1000-0000-0000-0000-000000000001', 'Aleze', 'Batalo Pharma', 'Kenya',
  200, 200, 6.5, 10, NULL, '2028-01-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('82b28583-46cd-47f7-9d4e-0bdb7d4481d6', 'ba7a1000-0000-0000-0000-000000000001', 'Momate', 'Batalo Pharma', 'Kenya',
  200, 200, 725.0, 10, NULL, '2026-09-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('06c3e20e-435c-4712-adc8-635be76863ab', 'ba7a1000-0000-0000-0000-000000000001', 'Normal Saline', 'Batalo Pharma', 'Kenya',
  200, 200, 93.1, 10, '2505202207', '2028-05-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('2d53a40b-9532-401c-afc2-55c0de25a971', 'ba7a1000-0000-0000-0000-000000000001', 'Neurocare', 'Batalo Pharma', 'Kenya',
  200, 200, 64.73, 10, NULL, '2027-01-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('ce619f61-b156-4ca6-908e-ee6505e5db11', 'ba7a1000-0000-0000-0000-000000000001', 'Esomac', 'Batalo Pharma', 'Kenya',
  200, 200, 34.21, 10, NULL, '2028-01-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('9e2acff7-efbb-4035-a568-d3b9d69f757b', 'ba7a1000-0000-0000-0000-000000000001', 'Keto Plus', 'Batalo Pharma', 'Kenya',
  200, 200, 1578.9, 10, NULL, '2026-07-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('43fe9a5a-6689-4970-be63-a09565211182', 'ba7a1000-0000-0000-0000-000000000001', 'Zupricin B', 'Batalo Pharma', 'Kenya',
  200, 200, 868.93, 10, '10251374', '2026-10-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('19903da2-134b-458a-8fdc-f074fcec030e', 'ba7a1000-0000-0000-0000-000000000001', 'Calamine', 'Batalo Pharma', 'Kenya',
  200, 200, 38.89, 10, '12825', '2028-07-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('24095dda-7759-4ead-a384-33210b7f9f9c', 'ba7a1000-0000-0000-0000-000000000001', 'Delased Chesty', 'Batalo Pharma', 'Kenya',
  200, 200, 181.13, 10, '250492', '2028-01-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('24095dda-7759-4ead-a384-33210b7f9f9c', 'ba7a1000-0000-0000-0000-000000000001', 'Delased Chesty N/D', 'Batalo Pharma', 'Kenya',
  200, 200, 178.73, 10, '241806', '2027-08-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('bc7275a4-6d8b-4368-abd2-3fd0096d00ff', 'ba7a1000-0000-0000-0000-000000000001', 'Delased Dry', 'Batalo Pharma', 'Kenya',
  200, 200, 178.73, 10, '251056', '2028-05-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('bc7275a4-6d8b-4368-abd2-3fd0096d00ff', 'ba7a1000-0000-0000-0000-000000000001', 'Delased Dry N/D', 'Batalo Pharma', 'Kenya',
  200, 200, 178.73, 10, '250489', '2028-01-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('609c9c21-72b8-40ae-9592-c8fe1c960106', 'ba7a1000-0000-0000-0000-000000000001', 'Delased Paed', 'Batalo Pharma', 'Kenya',
  200, 200, 178.73, 10, '251059', '2028-05-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('9e9c5fbb-b225-4d8c-bf5e-693cd615f4fd', 'ba7a1000-0000-0000-0000-000000000001', 'Vitaglobin', 'Batalo Pharma', 'Kenya',
  200, 200, 140.22, 10, NULL, '2028-04-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('9e9c5fbb-b225-4d8c-bf5e-693cd615f4fd', 'ba7a1000-0000-0000-0000-000000000001', 'Vitaglobin', 'Batalo Pharma', 'Kenya',
  200, 200, 140.22, 10, NULL, '2028-05-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('9b3ef320-2012-48bf-835b-a944a7c5df9d', 'ba7a1000-0000-0000-0000-000000000001', 'Betaserc', 'Batalo Pharma', 'Kenya',
  200, 200, 43.65, 10, NULL, '2026-10-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('539c68f6-3336-454f-aec1-99bf216ee3bb', 'ba7a1000-0000-0000-0000-000000000001', 'Rostat EZ', 'Batalo Pharma', 'Kenya',
  200, 200, 116.6, 10, NULL, '2026-12-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('07a56a2f-84e1-41f6-964e-5c6ce2975ffc', 'ba7a1000-0000-0000-0000-000000000001', 'Ventolin Evohaler', 'Batalo Pharma', 'Kenya',
  200, 200, 617.25, 10, NULL, '2027-01-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('cd910b67-f52f-4f09-9a8b-9363d7f3ffd9', 'ba7a1000-0000-0000-0000-000000000001', 'Azicip', 'Batalo Pharma', 'Kenya',
  200, 200, 128.68, 10, '5372311', '2028-06-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('16047ce2-242c-4649-882d-6a36b18618f7', 'ba7a1000-0000-0000-0000-000000000001', 'Omecos', 'Batalo Pharma', 'Kenya',
  200, 200, 5.0, 10, 'OP24030', '2027-02-28', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('e94dd79f-7b09-476a-85e2-3b2c405fc0ad', 'ba7a1000-0000-0000-0000-000000000001', 'Ezechol', 'Batalo Pharma', 'Kenya',
  200, 200, 85.84, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('c5007c3f-9aea-42bf-890f-e5320d0f6037', 'ba7a1000-0000-0000-0000-000000000001', 'Isoket', 'Batalo Pharma', 'Kenya',
  200, 200, 25.18, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('add3dd62-9281-40af-8d39-3232ecf4ea4d', 'ba7a1000-0000-0000-0000-000000000001', 'Ryaltris', 'Batalo Pharma', 'Kenya',
  200, 200, 2929.99, 10, NULL, '2026-10-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('22961e12-1e39-498a-96e1-85b9df7e6ecf', 'ba7a1000-0000-0000-0000-000000000001', 'Acetifizz', 'Batalo Pharma', 'Kenya',
  200, 200, 851.2, 10, NULL, '2026-09-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('039ca553-3708-4e2d-ab7f-119589cd5764', 'ba7a1000-0000-0000-0000-000000000001', 'Respizin', 'Batalo Pharma', 'Kenya',
  200, 200, 53.2, 10, NULL, '2026-01-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('129a2934-3b3b-4e58-a490-3d2d5026717a', 'ba7a1000-0000-0000-0000-000000000001', 'Duspatalin', 'Batalo Pharma', 'Kenya',
  200, 200, 79.55, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('f9c76f0e-6f2c-4df1-94ab-d5e4b24abba3', 'ba7a1000-0000-0000-0000-000000000001', 'Deriphyllin', 'Batalo Pharma', 'Kenya',
  200, 200, 36.31, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('f9c76f0e-6f2c-4df1-94ab-d5e4b24abba3', 'ba7a1000-0000-0000-0000-000000000001', 'Deriphyllin', 'Batalo Pharma', 'Kenya',
  200, 200, 36.31, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('22961e12-1e39-498a-96e1-85b9df7e6ecf', 'ba7a1000-0000-0000-0000-000000000001', 'Nacsys', 'Batalo Pharma', 'Kenya',
  200, 200, 111.99, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('6b50befe-8440-4d07-a457-5249ecb34f41', 'ba7a1000-0000-0000-0000-000000000001', 'Cilnitel', 'Batalo Pharma', 'Kenya',
  200, 200, 85.97, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('664c0d70-773a-47bd-835a-f1d0b28f9dfb', 'ba7a1000-0000-0000-0000-000000000001', 'Clozepam', 'Batalo Pharma', 'Kenya',
  200, 200, 372.4, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('119bab4c-c015-4839-abc8-f7a7e185be8e', 'ba7a1000-0000-0000-0000-000000000001', 'Erythromycin BP', 'Batalo Pharma', 'Kenya',
  200, 200, 8.91, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('3ea046aa-9a5e-4733-86a7-d36c7353e35c', 'ba7a1000-0000-0000-0000-000000000001', 'Icon', 'Batalo Pharma', 'Kenya',
  200, 200, 61.51, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('d4f03ec6-81fc-46ed-a8bf-b68479abe24d', 'ba7a1000-0000-0000-0000-000000000001', 'Triohist', 'Batalo Pharma', 'Kenya',
  200, 200, 109.06, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('7ebf8579-e61b-4bc3-a4b3-b753bd1d617f', 'ba7a1000-0000-0000-0000-000000000001', 'Cosmos', 'Batalo Pharma', 'Kenya',
  200, 200, 5.0, 10, '251424', '2028-11-01', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('63926684-b6b5-44ce-af5a-ca6be0ec7234', 'ba7a1000-0000-0000-0000-000000000001', 'Span K', 'Batalo Pharma', 'Kenya',
  200, 200, 25.54, 10, NULL, '2028-02-29', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('c2d811ea-400b-4f3e-aa3f-bedb9df91543', 'ba7a1000-0000-0000-0000-000000000001', 'Vaniqa', 'Batalo Pharma', 'Kenya',
  200, 200, 5500.0, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('250499e2-b1e9-41d5-af8a-f05edd194ffd', 'ba7a1000-0000-0000-0000-000000000001', 'Saracal', 'Batalo Pharma', 'Kenya',
  200, 200, 565.25, 10, NULL, '2027-09-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('f88b0446-1375-4c38-9572-15be5cf59f5d', 'ba7a1000-0000-0000-0000-000000000001', 'Empiget', 'Batalo Pharma', 'Kenya',
  200, 200, 113.64, 10, NULL, '2026-11-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('5db4e9bf-72d5-4793-8e8b-ccdae3d6884a', 'ba7a1000-0000-0000-0000-000000000001', 'Maxolon', 'Batalo Pharma', 'Kenya',
  200, 200, 21.28, 10, '2409161', '2027-08-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('2fba9667-d629-4212-b368-46221e530b06', 'ba7a1000-0000-0000-0000-000000000001', 'Flucoldex', 'Batalo Pharma', 'Kenya',
  200, 200, 7.98, 10, NULL, '2028-02-29', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('aa4bf00e-7da5-4dee-9ae5-159c23715238', 'ba7a1000-0000-0000-0000-000000000001', 'Ascoril D', 'Batalo Pharma', 'Kenya',
  200, 200, 516.04, 10, '10242412', '2026-09-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('2c47e0e3-4623-4b1a-a567-2de50e36480f', 'ba7a1000-0000-0000-0000-000000000001', 'Entamaxin', 'Batalo Pharma', 'Kenya',
  200, 200, 89.78, 10, NULL, '2028-05-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('dff85029-1a52-461f-b522-0a2acbf756ca', 'ba7a1000-0000-0000-0000-000000000001', 'Flugone P+', 'Batalo Pharma', 'Kenya',
  200, 200, 326.37, 10, NULL, '2027-05-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('dff85029-1a52-461f-b522-0a2acbf756ca', 'ba7a1000-0000-0000-0000-000000000001', 'Flugone P', 'Batalo Pharma', 'Kenya',
  200, 200, 228.83, 10, 'R37AA', '2028-03-01', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('acff1a12-53ec-4efc-996d-bc4c5044a54e', 'ba7a1000-0000-0000-0000-000000000001', 'Mefsun', 'Batalo Pharma', 'Kenya',
  200, 200, 4.59, 10, NULL, '2027-11-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('61e82a0a-b77a-4e68-8ff9-d6d2437e6fbc', 'ba7a1000-0000-0000-0000-000000000001', 'Ubinex LC', 'Batalo Pharma', 'Kenya',
  200, 200, 531.11, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('04e93b95-904c-4ce2-a4a4-2e13e47d7510', 'ba7a1000-0000-0000-0000-000000000001', 'Verclob', 'Batalo Pharma', 'Kenya',
  200, 200, 63.17, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('cff150ad-1553-42a6-827d-7bd0f5827449', 'ba7a1000-0000-0000-0000-000000000001', 'Glemont L', 'Batalo Pharma', 'Kenya',
  200, 200, 125.87, 10, 'L305201152b', '2026-07-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('b96035a3-a2bc-4c68-9d47-48296e4235ab', 'ba7a1000-0000-0000-0000-000000000001', 'Betmiga', 'Batalo Pharma', 'Kenya',
  200, 200, 5320.0, 10, '24K4049', '2027-10-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('724b3192-883b-4b07-b7b1-a5ca87f3dd5b', 'ba7a1000-0000-0000-0000-000000000001', 'Monteru', 'Batalo Pharma', 'Kenya',
  200, 200, 85.78, 10, '4G104', '2027-08-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('ec700c7d-54a8-47f6-b8ff-c80b6a91fb18', 'ba7a1000-0000-0000-0000-000000000001', 'Concerta', 'Batalo Pharma', 'Kenya',
  200, 200, 150.95, 10, '2142012', '2026-08-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('c6faca0f-df7e-4c71-926b-7eeaddf35c48', 'ba7a1000-0000-0000-0000-000000000001', 'Cartimove', 'Batalo Pharma', 'Kenya',
  200, 200, 56.75, 10, 'VO2401T', '2027-04-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('6a21d363-5fdf-4b64-ab60-38b1e7a670b3', 'ba7a1000-0000-0000-0000-000000000001', 'Vono Q', 'Batalo Pharma', 'Kenya',
  200, 200, 98.79, 10, 'M9-VQ0028', '2027-05-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('62ef9e70-7817-4a3b-b0a7-08b1c5a426ed', 'ba7a1000-0000-0000-0000-000000000001', 'Otorex', 'Batalo Pharma', 'Kenya',
  200, 200, 1085.75, 10, '25070065', '2027-01-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('36c75dc3-b49d-4ef5-99ec-11c2e45c8663', 'ba7a1000-0000-0000-0000-000000000001', 'Cadistin Plus', 'Batalo Pharma', 'Kenya',
  200, 200, 243.31, 10, 'M5-L25050', '2026-04-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('3e8408ca-cad6-4038-b781-6875c196f0ec', 'ba7a1000-0000-0000-0000-000000000001', 'Phenobarbitone', 'Batalo Pharma', 'Kenya',
  200, 200, 2.85, 10, '251234', '2028-08-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('f549e76f-7c47-4ef3-9fe6-7c62496ef378', 'ba7a1000-0000-0000-0000-000000000001', 'Oncosil', 'Batalo Pharma', 'Kenya',
  200, 200, 252.7, 10, 'OC27', '2028-07-01', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('17ca1d7a-96b7-4022-8020-3303538a58b4', 'ba7a1000-0000-0000-0000-000000000001', 'Tricohist', 'Batalo Pharma', 'Kenya',
  200, 200, 150.13, 10, '1025112', '2028-09-30', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('2e1794d2-1dbe-4d82-9aa2-861bfd80c735', 'ba7a1000-0000-0000-0000-000000000001', 'Tramadol', 'Batalo Pharma', 'Kenya',
  200, 200, 4.26, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('e8685455-2234-42d2-977d-f9b03f1e0466', 'ba7a1000-0000-0000-0000-000000000001', 'Eflaron Plus', 'Batalo Pharma', 'Kenya',
  200, 200, 107.24, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('850e019c-cf74-4510-b29c-37ca3c9c2c45', 'ba7a1000-0000-0000-0000-000000000001', 'Gastoral', 'Batalo Pharma', 'Kenya',
  200, 200, 39.0, 10, '85567', '2026-02-28', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('6d975395-c9a4-4204-ba92-24ccf97fb14c', 'ba7a1000-0000-0000-0000-000000000001', 'Dextracin', 'Batalo Pharma', 'Kenya',
  200, 200, 315.88, 10, NULL, '2026-02-28', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('9715034d-10c1-453b-8b7b-e4651e53879d', 'ba7a1000-0000-0000-0000-000000000001', 'Futsil', 'Batalo Pharma', 'Kenya',
  200, 200, 305.24, 10, NULL, '2027-01-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('64e379c6-ab4a-4a22-8620-7f9c57611a74', 'ba7a1000-0000-0000-0000-000000000001', 'Lumigan', 'Batalo Pharma', 'Kenya',
  200, 200, 2669.94, 10, '417230', '2026-10-31', 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('bab2b083-f79e-48cc-82c5-02bd3e749fae', 'ba7a1000-0000-0000-0000-000000000001', 'Mebux', 'Batalo Pharma', 'Kenya',
  200, 200, 67.07, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('829a8740-a32c-4dfa-860c-687d80736542', 'ba7a1000-0000-0000-0000-000000000001', 'Febuxostat 80', 'Batalo Pharma', 'Kenya',
  200, 200, 175.56, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('39d94088-22ba-47d5-95cb-83386bd68f4f', 'ba7a1000-0000-0000-0000-000000000001', 'Trinerve', 'Batalo Pharma', 'Kenya',
  200, 200, 23.94, 10, NULL, NULL, 'active');
INSERT INTO listings (drug_id, seller_id, brand_name, manufacturer, origin_country,
  qty_available, qty_remaining, price_per_unit, min_order_qty, batch_no, expiry_date, status)
VALUES ('bbacd2a6-1107-40ec-96de-d60bf5959084', 'ba7a1000-0000-0000-0000-000000000001', 'Flairof', 'Batalo Pharma', 'Kenya',
  200, 200, 265.33, 10, NULL, NULL, 'active');
