/**
 * Comprehensive Backend Error Translator for Hwyati (هويتي)
 * Translates 100% of ASP.NET Core backend error messages, FluentValidation rules,
 * domain exceptions, and controller failure responses into authoritative, formal Arabic.
 * Strictly no backend modification required.
 */

export const EXACT_TRANSLATIONS: Record<string, string> = {
  // ── A ────────────────────────────────────────────────────────────────────────
  "A death certificate has already been issued for this person.":
    "تم إصدار شهادة وفاة لهذا الشخص مسبقاً في السجل المدني.",
  "A valid email address is required.":
    "يرجى إدخال بريد إلكتروني صالح ومعتمد.",
  "Access Denied: The specified branch is inactive or does not exist.":
    "تم رفض الدخول: الفرع المحدد غير نشط أو غير موجود في المنظومة.",
  "Access Denied: You are not assigned as an active staff member for this branch.":
    "تم رفض الدخول: لست مسجلاً كعضو كادر نشط في هذا الفرع.",
  "Active Family record for the husband was not found.":
    "لم يتم العثور على قيد عائلي نشط للزوج في مصلحة الأحوال المدنية.",
  "Active National ID Card for this citizen was not found.":
    "لم يتم العثور على بطاقة شخصية نشطة ومفعلة لهذا المواطن.",
  "Active National ID Card with the specified ID was not found.":
    "لم يتم العثور على بطاقة شخصية نشطة بالمعرّف المحدد.",
  "Active Passport for this citizen was not found.":
    "لم يتم العثور على جواز سفر نشط وساري المفعول لهذا المواطن.",
  "Active Passport with the specified ID was not found.":
    "لم يتم العثور على جواز سفر نشط بالمعرّف المحدد.",
  "Address details are required when creating a new person.":
    "تفاصيل العنوان مطلوبة وإلزامية عند إنشاء قيد مدني جديد.",
  "Address details are required.":
    "تفاصيل العنوان مطلوبة وإلزامية.",
  "Address details must not exceed 200 characters.":
    "تفاصيل العنوان يجب ألا تتجاوز 200 حرف.",
  "Admin / Employee record was not found.":
    "لم يتم العثور على سجل المدير أو الموظف في النظام.",
  "Admin can only transfer or assign employees to their own branch.":
    "يمكن للمدير فقط تعيين أو نقل الموظفين إلى الفرع التابع له.",
  "Admin record was not found.":
    "لم يتم العثور على سجل المدير في النظام.",
  "An account with this email address already exists.":
    "يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني في المنظومة.",
  "An account with this National Number already exists.":
    "يوجد حساب مسجل بالفعل بهذا الرقم الوطني في المنظومة.",
  "Associated user account was not found.":
    "لم يتم العثور على حساب المستخدم المرتبط.",

  // ── B ────────────────────────────────────────────────────────────────────────
  "Birth certificate ID is required.":
    "معرّف شهادة الميلاد مطلوب.",
  "Birth certificate with the specified ID was not found.":
    "لم يتم العثور على شهادة ميلاد بالمعرّف المحدد.",
  "Blood group is required when creating a new person.":
    "فصيلة الدم مطلوبة وإلزامية عند إنشاء قيد مدني جديد.",
  "Blood group is required.":
    "فصيلة الدم مطلوبة وإلزامية.",
  "Branch ID is required for staff authentication.":
    "معرّف الفرع مطلوب لتسجيل دخول كوادر الدولة.",
  "Branch ID is required.":
    "معرّف الفرع مطلوب لإتمام الإجراء.",
  "Branch name is required.":
    "اسم الفرع مطلوب.",
  "Branch name must not exceed 150 characters.":
    "اسم الفرع يجب ألا يتجاوز 150 حرفاً.",

  // ── C ────────────────────────────────────────────────────────────────────────
  "Cannot change status of a cancelled request.":
    "لا يمكن تغيير حالة معاملة ملغاة نهائياً.",
  "Cannot change status of an already issued request.":
    "لا يمكن تعديل حالة معاملة تم إصدار وثيقتها رسمياً.",
  "Cause of death cannot exceed 500 characters.":
    "سبب الوفاة يجب ألا يتجاوز 500 حرف.",
  "Cause of death is required.":
    "سبب الوفاة مطلوب وإلزامي لتوثيق واقعة الوفاة.",
  "Child person record associated with this birth certificate was not found.":
    "لم يتم العثور على قيد الطفل المرتبط بشهادة الميلاد هذه.",
  "Citizen account is already active.":
    "حساب المواطن نشط ومفعل مسبقاً في النظام.",
  "Citizen Civil Registry record not found.":
    "سجل قيد المواطن غير موجود في مصلحة الأحوال المدنية.",
  "Citizen does not have an active user account in the system.":
    "المواطن لا يمتلك حساب مستخدم نشط في المنظومة حتى الآن.",
  "Citizen security context invalid.":
    "السياق الأمني لهوية المواطن غير صالح.",
  "Citizen with the provided National Number was not found in Civil Registry.":
    "لم يتم العثور على مواطن بالرقم الوطني المدخل في سجلات الأحوال المدنية.",
  "Citizen with the provided National Number was not found in the Civil Registry.":
    "لم يتم العثور على مواطن بالرقم الوطني المدخل في السجل المدني.",
  "Code must be 6 digits.":
    "رمز التحقق يجب أن يتكون من 6 أرقام بدقة.",
  "Contract photo URL must not exceed 500 characters.":
    "رابط وثيقة عقد الزواج يجب ألا يتجاوز 500 حرف.",
  "Country name is required.":
    "اسم الدولة مطلوب لتوثيق حركة السفر.",
  "Country name must not exceed 50 characters.":
    "اسم الدولة يجب ألا يتجاوز 50 حرفاً.",
  "Current logged-in admin is not associated with an active branch.":
    "المدير الحالي المسجل دخوله غير مرتبط بأي فرع نشط.",
  "Current logged-in user is not assigned as an active admin to any branch.":
    "المستخدم الحالي ليس لديه صفة مدير نشط لأي فرع معتمد.",

  // ── D ────────────────────────────────────────────────────────────────────────
  "Date of Birth is required.":
    "تاريخ الميلاد مطلوب وإلزامي.",
  "Date of Birth must be in the past.":
    "تاريخ الميلاد يجب أن يكون تاريخاً سابقاً لتاريخ اليوم.",
  "Date of birth cannot be in the future.":
    "تاريخ الميلاد لا يمكن أن يكون في المستقبل.",
  "Date of birth is required when creating a new person.":
    "تاريخ الميلاد مطلوب وإلزامي عند إنشاء قيد مدني جديد.",
  "Date of birth must be in the past.":
    "تاريخ الميلاد يجب أن يكون تاريخاً سابقاً لتاريخ اليوم.",
  "Date of death cannot be in the future.":
    "تاريخ الوفاة لا يمكن أن يكون في المستقبل.",
  "Date of death is required.":
    "تاريخ الوفاة مطلوب وإلزامي لتوثيق الواقعة.",
  "Death Certificate ID is required.":
    "معرّف شهادة الوفاة مطلوب.",
  "Death certificate record was not found.":
    "لم يتم العثور على سجل شهادة الوفاة في المنظومة.",
  "Death certificate with the specified ID was not found.":
    "لم يتم العثور على شهادة وفاة بالمعرّف المحدد.",
  "Deceased person national number is required.":
    "الرقم الوطني للمتوفى مطلوب وإلزامي.",
  "Deceased person national number must be exactly 11 digits.":
    "الرقم الوطني للمتوفى يجب أن يتكون من 11 رقماً بدقة.",
  "Deceased person record with the provided national number was not found.":
    "لم يتم العثور على قيد مدني للمتوفى بالرقم الوطني المدخل.",
  "Departure date (LeftAt) cannot be in the future.":
    "تاريخ مغادرة الأسرة لا يمكن أن يكون في المستقبل.",
  "Device Identifier is required.":
    "معرّف الجهاز مطلوب وإلزامي للمصادقة الأمنية.",
  "Device record not found.":
    "لم يتم العثور على سجل الجهاز المعتمد.",
  "District is required when creating a new person.":
    "حقل المديرية مطلوب عند إنشاء قيد مدني جديد.",
  "District is required.":
    "حقل المديرية مطلوب وإلزامي.",
  "District must not exceed 100 characters.":
    "اسم المديرية يجب ألا يتجاوز 100 حرف.",
  "District must not exceed 50 characters.":
    "اسم المديرية يجب ألا يتجاوز 50 حرفاً.",
  "Document numbers can only be issued by Civil Registry branches.":
    "أرقام الوثائق الرسمية تصدر حصراً من فروع مصلحة الأحوال المدنية والسجل المدني.",

  // ── E ────────────────────────────────────────────────────────────────────────
  "Email address is required.":
    "البريد الإلكتروني مطلوب وإلزامي.",
  "Employee ID is required.":
    "معرّف الموظف مطلوب لإتمام العملية.",
  "Employee is already active.":
    "الموظف نشط ومفعل بالفعل في النظام.",
  "Employee is already assigned to this branch.":
    "الموظف مسند بالفعل إلى هذا الفرع.",
  "Employee is already deactivated.":
    "حساب الموظف معطل بالفعل مسبقاً.",
  "Employee record was not found.":
    "لم يتم العثور على سجل الموظف في النظام.",
  "Employee was not found in your branch.":
    "لم يتم العثور على الموظف المحدد ضمن كوادر فرعك.",
  "Entry date is required.":
    "تاريخ الدخول مطلوب لتوثيق حركة السفر.",
  "Exit date must be equal to or after entry date.":
    "تاريخ المغادرة يجب أن يكون مماثلاً أو لاحقاً لتاريخ الدخول.",

  // ── F ────────────────────────────────────────────────────────────────────────
  "Failed to create user account.":
    "فشل إنشاء حساب المستخدم في النظام، يرجى المحاولة لاحقاً.",
  "Failed to reset password. Please ensure password meets security rules.":
    "فشلت إعادة تعيين كلمة المرور، يرجى التأكد من استيفاء معايير الأمان.",
  "Failed to send device verification OTP email. Please try again later.":
    "تعذر إرسال رمز التحقق الأمني للجهاز، يرجى المحاولة لاحقاً.",
  "Failed to send OTP verification email. Please check email service configuration.":
    "تعذر إرسال رمز التحقق بالبريد الإلكتروني، يرجى مراجعة إعدادات الخدمة.",
  "Failed to send password reset OTP email. Please try again later.":
    "تعذر إرسال رمز استعادة كلمة المرور، يرجى المحاولة لاحقاً.",
  "Failed to send verification OTP email. Please check email service configuration.":
    "تعذر إرسال رمز التحقق الإلكتروني، يرجى التحقق من صحة البريد.",
  "Failed to update citizen account status.":
    "فشل تحديث حالة حساب المواطن في النظام.",
  "Family ID is required.":
    "معرّف القيد العائلي مطلوب (يشترط ربط الواقعة ببطاقة عائلية سارية).",
  "Family member identifier is required.":
    "معرّف فرد الأسرة مطلوب لإتمام التعديل.",
  "Family name is required when creating a new person.":
    "اسم اللقب / العائلة مطلوب عند إنشاء قيد مدني جديد.",
  "Family name is required.":
    "اسم اللقب / العائلة مطلوب وإلزامي.",
  "Family name must not exceed 50 characters.":
    "اسم اللقب / العائلة يجب ألا يتجاوز 50 حرفاً.",
  "Family number is required.":
    "رقم القيد العائلي مطلوب.",
  "Family number must be exactly 11 digits.":
    "رقم البطاقة العائلية يجب أن يتكون من 11 رقماً بدقة.",
  "Father name is required when creating a new person.":
    "اسم الأب مطلوب عند إنشاء قيد مدني جديد.",
  "Father name is required.":
    "اسم الأب مطلوب وإلزامي.",
  "Father name must not exceed 50 characters.":
    "اسم الأب يجب ألا يتجاوز 50 حرفاً.",
  "Father national number is required.":
    "الرقم الوطني للأب مطلوب وإلزامي.",
  "Father national number must be exactly 11 digits.":
    "الرقم الوطني للأب يجب أن يتكون من 11 رقماً بدقة.",
  "Father person record with the provided national number was not found.":
    "لم يتم العثور على قيد مدني للأب بالرقم الوطني المدخل.",
  "First name is required when creating a new person.":
    "الاسم الأول مطلوب عند إنشاء قيد مدني جديد.",
  "First name is required.":
    "الاسم الأول مطلوب وإلزامي.",
  "First name must not exceed 50 characters.":
    "الاسم الأول يجب ألا يتجاوز 50 حرفاً.",

  // ── G ────────────────────────────────────────────────────────────────────────
  "Gender is required when creating a new person.":
    "الجنس مطلوب وإلزامي عند إنشاء قيد مدني جديد.",
  "Governorate is required when creating a new person.":
    "المحافظة مطلوبة عند إنشاء قيد مدني جديد.",
  "Governorate is required.":
    "حقل المحافظة مطلوب وإلزامي.",
  "Governorate must not exceed 100 characters.":
    "اسم المحافظة يجب ألا يتجاوز 100 حرف.",
  "Governorate must not exceed 50 characters.":
    "اسم المحافظة يجب ألا يتجاوز 50 حرفاً.",
  "Grandfather name is required when creating a new person.":
    "اسم الجد مطلوب عند إنشاء قيد مدني جديد.",
  "Grandfather name is required.":
    "اسم الجد مطلوب وإلزامي.",
  "Grandfather name must not exceed 50 characters.":
    "اسم الجد يجب ألا يتجاوز 50 حرفاً.",

  // ── H ────────────────────────────────────────────────────────────────────────
  "Head of family member status cannot be modified directly.":
    "لا يمكن تعديل حالة رب الأسرة مباشرة من هذه الواجهة.",
  "Hospital branch ID is required.":
    "معرّف فرع المستشفى مطلوب وإلزامي.",
  "Hospital branch was not found.":
    "فرع المستشفى المحدد غير مسجل في النظام.",
  "Husband already possesses an active Family Record. Use Add Wife service to register additional wives.":
    "الزوج يمتلك بالفعل بطاقة عائلية نشطة. يرجى استخدام خدمة (إضافة زوجة) لقيد الزوجات الإضافيات.",
  "Husband and Wife National Numbers cannot be identical.":
    "الرقم الوطني للزوج والزوجة لا يمكن أن يكون متطابقاً.",
  "Husband citizen record was not found in Civil Registry.":
    "لم يتم العثور على قيد مدني للزوج في سجلات الأحوال المدنية.",
  "Husband National Number is required.":
    "الرقم الوطني للزوج مطلوب وإلزامي.",
  "Husband National Number must be exactly 11 digits.":
    "الرقم الوطني للزوج يجب أن يتكون من 11 رقماً بدقة.",

  // ── I ────────────────────────────────────────────────────────────────────────
  "Invalid blood group value.":
    "قيمة فصيلة الدم المدخلة غير صحيحة.",
  "Invalid citizen identity.":
    "هوية المواطن غير صحيحة أو غير صالحة.",
  "Invalid family member status specified.":
    "حالة فرد الأسرة المحددة غير صالحة.",
  "Invalid gender value.":
    "قيمة الجنس المدخلة غير صحيحة.",
  "Invalid marital status value.":
    "الحالة الاجتماعية المدخلة غير صالحة.",
  "Invalid National Number or code.":
    "الرقم الوطني أو رمز التحقق المدخل غير صحيح.",
  "Invalid National Number or Password.":
    "الرقم الوطني أو كلمة المرور غير صحيحة.",
  "Invalid or expired OTP verification code.":
    "رمز التحقق منتهي الصلاحية أو غير صحيح.",
  "Invalid or expired verification code.":
    "رمز التحقق منتهي الصلاحية أو غير صالح.",
  "Invalid or missing User ID claim in token.":
    "رمز الدخول يفتقر لمعرّف مستخدم صالح وموثق.",
  "Invalid or missing User ID in token.":
    "رمز التحقق لا يحتوي على معرّف مستخدم صالح.",
  "Invalid or unverified document payload.":
    "بيانات الوثيقة أو رمز الاستجابة السريعة (QR) غير صالحة أو غير موثقة.",
  "Invalid passport type specified.":
    "نوع جواز السفر المحدد غير معتمد.",
  "Invalid payload format for Birth Registration command.":
    "صيغة بيانات تسجيل بلاغ الميلاد غير متوافقة مع معايير المنظومة.",
  "Invalid payload format for Death Registration command.":
    "صيغة بيانات تسجيل بلاغ الوفاة غير متوافقة مع معايير المنظومة.",
  "Invalid payload format for Family Card Renewal command.":
    "صيغة بيانات تجديد البطاقة العائلية غير صالحة.",
  "Invalid payload format for National ID Renewal command.":
    "صيغة بيانات تجديد البطاقة الشخصية غير صالحة.",
  "Invalid payload format for Passport Renewal command.":
    "صيغة بيانات تجديد جواز السفر غير صالحة.",
  "Invalid Phone Number format.":
    "صيغة رقم الهاتف غير صحيحة (يجب أن يبدأ بـ 7 ويتكون من 9 أرقام).",
  "Invalid request identifier.":
    "معرّف المعاملة أو الطلب غير صالح.",
  "Invalid request parameter or citizen identity.":
    "بيانات الطلب أو هوية المواطن غير صحيحة.",
  "Invalid request status specified.":
    "حالة المعاملة المحددة غير صحيحة.",
  "Invalid user security identifier.":
    "المعرّف الأمني للمستخدم غير صالح.",
  "Invalid verification code or no active code found.":
    "رمز التحقق غير صحيح أو لا يوجد رمز نشط حالياً.",
  "Invalid verification code.":
    "رمز التحقق المدخل غير صحيح.",
  "Invalid, used, or revoked refresh token.":
    "جلسة الدخول منتهية أو تم إلغاؤها، يرجى إعادة تسجيل الدخول.",
  "Issue date cannot be in the past.":
    "تاريخ الإصدار لا يمكن أن يكون في الماضي.",
  "Issuing branch ID is required.":
    "معرّف الفرع المصدر مطلوب وإلزامي.",
  "Issuing branch identifier is required.":
    "معرّف الفرع المصدر للوثيقة مطلوب.",
  "Issuing civil registry branch ID is required.":
    "معرّف فرع السجل المدني المصدر مطلوب.",

  // ── M ────────────────────────────────────────────────────────────────────────
  "Marital status is required when creating a new person.":
    "الحالة الاجتماعية مطلوبة عند إنشاء قيد مدني جديد.",
  "Marital status is required.":
    "الحالة الاجتماعية مطلوبة وإلزامية.",
  "Marriage contract number is required.":
    "رقم وثيقة عقد الزواج مطلوب وإلزامي.",
  "Marriage contract number must not exceed 30 characters.":
    "رقم وثيقة عقد الزواج يجب ألا يتجاوز 30 حرفاً.",
  "Marriage date cannot be in the future.":
    "تاريخ عقد الزواج لا يمكن أن يكون في المستقبل.",
  "Marriage date is required.":
    "تاريخ عقد الزواج مطلوب وإلزامي.",
  "Mother national number cannot be the same as father national number.":
    "الرقم الوطني للأم لا يمكن أن يتطابق مع الرقم الوطني للأب.",
  "Mother national number is required.":
    "الرقم الوطني للأم مطلوب وإلزامي.",
  "Mother national number must be exactly 11 digits.":
    "الرقم الوطني للأم يجب أن يتكون من 11 رقماً بدقة.",
  "Mother person record with the provided national number was not found.":
    "لم يتم العثور على قيد مدني للأم بالرقم الوطني المدخل.",

  // ── N ────────────────────────────────────────────────────────────────────────
  "National number is required.":
    "الرقم الوطني مطلوب وإلزامي.",
  "National Number is required.":
    "الرقم الوطني مطلوب وإلزامي.",
  "National number must be 10 digits.":
    "الرقم الوطني يجب أن يتكون من 11 رقماً رسمياً.",
  "National Number must be exactly 11 digits.":
    "الرقم الوطني يجب أن يتكون من 11 رقماً بدقة.",
  "National Number must contain digits only.":
    "الرقم الوطني يجب أن يحتوي على أرقام فقط بدون أحرف أو رموز.",
  "National number must not exceed 20 characters.":
    "الرقم الوطني يجب ألا يتجاوز الحد الأقصى للمدخلات.",
  "Nationality is required when creating a new person.":
    "الجنسية مطلوبة وإلزامية عند إنشاء قيد مدني جديد.",
  "Nationality must not exceed 50 characters.":
    "اسم الجنسية يجب ألا يتجاوز 50 حرفاً.",
  "New Branch ID is required.":
    "معرّف الفرع الجديد مطلوب لإتمام النقل.",
  "New password is required.":
    "كلمة المرور الجديدة مطلوبة.",
  "No active National ID Card found for this citizen.":
    "لا توجد بطاقة شخصية نشطة وسارية لهذا المواطن.",
  "No citizen record found with the provided National Number.":
    "لم يتم العثور على أي مواطن مسجل بالرقم الوطني المحدد.",
  "No document scan file was uploaded.":
    "لم يتم إرفاق أو رفع ملف المسح الضوئي للوثيقة.",
  "No Family record found with the provided Family Number.":
    "لم يتم العثور على بطاقة عائلية برقم القيد العائلي المدخل.",
  "No image file stream was provided.":
    "لم يتم إرسال ملف الصورة بشكل صحيح.",
  "No image file was uploaded.":
    "لم يتم اختيار أو رفع أي ملف صورة شخصية.",
  "No person record found in Civil Registry with the provided National Number.":
    "لا يوجد قيد مدني مسجل بالرقم الوطني المدخل في مصلحة الأحوال المدنية.",
  "No person record found in Civil Registry with this National Number.":
    "لم يتم العثور على قيد في السجل المدني بهذا الرقم الوطني.",
  "No person record found with the provided national number.":
    "لا يوجد قيد مدني مسجل بالرقم الوطني المدخل.",

  // ── O ────────────────────────────────────────────────────────────────────────
  "Only pending requests can be cancelled.":
    "يمكن فقط إلغاء المعاملات التي لا تزال في حالة الانتظار (قيد المعالجة).",
  "Organization branch was not found.":
    "فرع الجهة الحكومية غير موجود في النظام.",
  "Organization ID is required.":
    "معرّف الجهة التابع لها الفرع مطلوب.",
  "OTP Verification Code is required.":
    "رمز التحقق الأمني مطلوب لإتمام التفعيل.",

  // ── P ────────────────────────────────────────────────────────────────────────
  "Passport Number is required.":
    "رقم جواز السفر مطلوب وإلزامي.",
  "Passport numbers can only be issued by Immigration and Passports branches.":
    "أرقام الجوازات تصدر حصراً من فروع مصلحة الهجرة والجوازات والجنسية.",
  "Password is required.":
    "كلمة المرور مطلوبة وإلزامية.",
  "Password must be at least 8 characters long.":
    "كلمة المرور يجب أن تتكون من 8 خانات على الأقل.",
  "Password must be at least 8 characters.":
    "كلمة المرور يجب ألا تقل عن 8 خانات.",
  "Password must contain at least one lowercase letter.":
    "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل (a-z).",
  "Password must contain at least one number.":
    "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل (0-9).",
  "Password must contain at least one uppercase letter.":
    "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل (A-Z).",
  "Person with the provided ID was not found.":
    "لم يتم العثور على سجل المواطن المحدد.",
  "Phone Number is required.":
    "رقم الهاتف مطلوب وإلزامي.",
  "Phone number must not exceed 20 characters.":
    "رقم الهاتف يجب ألا يتجاوز 20 رقماً.",
  "Photo URL must not exceed 500 characters.":
    "رابط الصورة الشخصية يجب ألا يتجاوز 500 حرف.",
  "Place of birth is required when creating a new person.":
    "محل الميلاد مطلوب عند إنشاء قيد مدني جديد.",
  "Place of birth is required.":
    "محل الميلاد مطلوب وإلزامي.",
  "Place of birth must not exceed 100 characters.":
    "محل الميلاد يجب ألا يتجاوز 100 حرف.",
  "Place of death cannot exceed 200 characters.":
    "مكان الوفاة يجب ألا يتجاوز 200 حرف.",
  "Place of death is required.":
    "مكان الوفاة مطلوب وإلزامي لتوثيق الواقعة.",
  "Provided Date of Birth does not match official Civil Registry records.":
    "تاريخ الميلاد المدخل غير مطابق لقيود السجل المدني الرسمية.",

  // ── R ────────────────────────────────────────────────────────────────────────
  "Refresh token has expired. Please log in again.":
    "انتهت جلسة تسجيل الدخول الممتدة، يرجى الدخول مجدداً للمنظومة.",
  "Rejection reason is strictly required when rejecting a request.":
    "سبب الرفض إلزامي ومطلوب قانونياً عند رفض أي معاملة أو طلب رسمي.",
  "Request payload data is missing. Cannot fulfill document issuance.":
    "بيانات حمولة الطلب مفقودة، لا يمكن استكمال إصدار الوثيقة الرسمية.",
  "Requested Role is required.":
    "نوع الصلاحية المطلوبة محدد ومطلوب للدخول.",

  // ── S ────────────────────────────────────────────────────────────────────────
  "Service Request ID is required.":
    "معرّف المعاملة / طلب الخدمة مطلوب.",
  "Service request not found.":
    "المعاملة المطلوبة غير موجودة في سجلات النظام.",
  "Service request record was not found.":
    "لم يتم العثور على سجل المعاملة المحدد.",
  "Service Type ID is required.":
    "معرّف نوع الخدمة الحكومية مطلوب.",
  "Specified birth certificate record was not found.":
    "شهادة الميلاد المحددة غير موجودة في السجل المدني.",
  "Specified death certificate record was not found.":
    "شهادة الوفاة المحددة غير موجودة في السجل المدني.",
  "Specified family member record was not found.":
    "فرد الأسرة المحدد غير مسجل في القيد العائلي.",
  "Specified Family record was not found.":
    "سجل القيد العائلي المحدد غير موجود في مصلحة الأحوال المدنية.",
  "Specified hospital branch was not found or is inactive.":
    "فرع المستشفى المحدد غير موجود أو غير مفعل في المنظومة.",
  "Specified organization branch was not found or is inactive.":
    "فرع الجهة الحكومية المحدد غير موجود أو معطل حالياً.",
  "Specified service type does not exist or is currently inactive.":
    "نوع الخدمة الحكومية المحدد غير متوفر أو غير نشط حالياً.",

  // ── T ────────────────────────────────────────────────────────────────────────
  "Target family record was not found.":
    "القيد العائلي المستهدف غير موجود في السجل المدني.",
  "Target organization branch was not found or is inactive.":
    "الفرع الحكومي المستهدف غير موجود أو غير مفعل.",
  "Target Person record associated with the request was not found.":
    "لم يتم العثور على القيد المدني للمواطن صاحب المعاملة.",
  "The admin is already assigned to this branch.":
    "المدير معين بالفعل مسبقاً في هذا الفرع.",
  "The citizen has not registered an online account in Huwiyati app yet.":
    "المواطن لم يقم بإنشاء حساب رقمي في تطبيق هويتي حتى الآن.",
  "The ContractNumber is currently used with another Marriage contranct record.":
    "رقم وثيقة عقد الزواج مسجل مسبقاً في قيد زواج آخر في السجل المدني.",
  "The specified employee is not an Admin.":
    "الموظف المحدد لا يمتلك صلاحيات مدير فرع.",
  "The specified father is not the registered head of this family.":
    "الأب المحدد ليس هو رب الأسرة المسجل رسمياً في هذا القيد العائلي.",
  "The specified organization branch was not found or is inactive.":
    "الفرع الحكومي المحدد غير موجود أو غير مفعل.",
  "The specified organization was not found or is inactive.":
    "الجهة الحكومية المحددة غير موجودة أو معطلة.",
  "The specified organization was not found.":
    "الجهة الحكومية المحددة غير مسجلة في المنظومة.",
  "The specified wife is currently registered as an active wife in another family record.":
    "الزوجة المحددة مسجلة كزوجة نشطة في قيد عائلي آخر في السجل المدني.",
  "The specified wife is currently registered as an active wife in another family record. Citizen must be divorced before creating a new marriage contract.":
    "الزوجة المحددة مسجلة كزوجة نشطة في قيد عائلي آخر. يجب إثبات واقعة الطلاق في السجل المدني أولاً قبل قيد عقد زواج جديد.",
  "The target organization branch was not found or is inactive.":
    "الفرع الحكومي المستهدف غير موجود أو غير نشط.",
  "This citizen is already assigned as an active Admin to this branch.":
    "هذا المواطن معين بالفعل كمدير نشط لهذا الفرع.",
  "This citizen is already assigned as an employee or admin to a branch.":
    "هذا المواطن مسجل بالفعل كموظف أو مدير في أحد فروع الدولة.",
  "This person already possesses an active National ID Card.":
    "المواطن يمتلك بالفعل بطاقة شخصية ذكية نشطة وسارية الصلاحية.",
  "This person already possesses an active Passport.":
    "المواطن يمتلك بالفعل جواز سفر نشط وساري المفعول.",
  "This person is already registered as deceased in the system.":
    "هذا الشخص مسجل كمتوفى رسمياً في قواعد بيانات السجل المدني.",
  "This user is already an active Admin in another branch. Use Update Admin to transfer the admin to this branch.":
    "هذا المستخدم مدير نشط بالفعل في فرع آخر. يرجى استخدام خدمة نقل المدير لنقله لهذا الفرع.",
  "Travel record can only be added to an active Passport.":
    "يمكن فقط تسجيل حركة سفر لجواز سفر نشط وساري المفعول.",
  "Travel record with the specified ID was not found.":
    "لم يتم العثور على سجل حركة السفر بالمعرّف المحدد.",

  // ── U ────────────────────────────────────────────────────────────────────────
  "Unauthorized. You can only view death certificates of immediate family members.":
    "غير مصرح لك: يمكنك فقط استعراض شهادات الوفاة لأفراد الأسرة المباشرين.",
  "Unauthorized. You can only view service requests belonging to you.":
    "غير مصرح لك: يمكنك فقط متابعة واستعراض المعاملات والطلبات الخاصة بك.",
  "Unauthorized. You can only view service requests submitted to your assigned branch.":
    "غير مصرح لك: يمكنك فقط معالجة واستعراض المعاملات الواردة لفرعك المسند إليك.",
  "User account or associated Person record not found.":
    "لم يتم العثور على حساب المستخدم أو القيد المدني المرتبط به.",
  "User account was not found.":
    "لم يتم العثور على حساب المستخدم.",
  "User ID claim is missing or invalid.":
    "بيانات هوية المستخدم في الرمز الأمني غير صالحة.",
  "User ID is required.":
    "معرّف المستخدم مطلوب لإتمام العملية.",
  "User not found.":
    "المستخدم غير موجود في النظام.",

  // ── V ────────────────────────────────────────────────────────────────────────
  "Validation failed. Please correct the highlighted errors.":
    "فشل التحقق من صحة البيانات المدخلة؛ يرجى مراجعة الحقول المطلوبة واستيفائها.",
  "Verification code has expired.":
    "رمز التحقق منتهي الصلاحية، يرجى طلب رمز جديد.",
  "Verification code has expired. Please request a new one.":
    "رمز التحقق منتهي الصلاحية، يرجى طلب رمز تحقق أمني جديد.",
  "Verification code is required.":
    "رمز التحقق مطلوب وإلزامي.",
  "Verification code must be exactly 6 digits.":
    "رمز التحقق يجب أن يتكون من 6 أرقام بدقة.",
  "Verification code must contain only numbers.":
    "رمز التحقق يجب أن يحتوي على أرقام فقط.",
  "Verification payload cannot be empty.":
    "بيانات التحقق من صحة الوثيقة لا يمكن أن تكون فارغة.",

  // ── W ────────────────────────────────────────────────────────────────────────
  "Wife citizen record was not found in Civil Registry.":
    "لم يتم العثور على قيد مدني للزوجة في سجلات الأحوال المدنية.",
  "Wife National Number is required.":
    "الرقم الوطني للزوجة مطلوب وإلزامي.",
  "Wife National Number must be exactly 11 digits.":
    "الرقم الوطني للزوجة يجب أن يتكون من 11 رقماً بدقة.",

  // ── Y ────────────────────────────────────────────────────────────────────────
  "You are not authorized to cancel requests outside your assigned branch.":
    "غير مصرح لك بإلغاء معاملات خارج نطاق الفرع المسند إليك.",
  "You are not authorized to process requests outside your assigned branch.":
    "غير مصرح لك بمعالجة معاملات خارج اختصاص الفرع المسند إليك.",
  "You do not have permission to cancel this request.":
    "ليس لديك الصلاحية القانونية لإلغاء هذا الطلب.",
  "Your account has been suspended by administration. Please visit a service center to reactivate your account.":
    "تم تعليق حسابك من قِبل إدارة المنظومة. يرجى مراجعة أقرب مركز خدمة لتحديث بياناتك وتفعيل الحساب.",
  "Your account is currently deactivated. Please request a reactivation code via /api/v1/account/request-otp.":
    "حسابك معطل حالياً. يرجى طلب رمز إعادة التفعيل لتنشيط الحساب."
};

/**
 * Dynamic / Parametric Regex Translations
 */
export const PATTERN_TRANSLATIONS: Array<{
  regex: RegExp;
  replace: (...args: any[]) => string;
}> = [
  {
    regex: /Access Denied: You do not possess the '([^']+)' role/i,
    replace: (_, role) => `تم رفض الوصول: حسابك لا يمتلك صلاحية دور (${role}) في النظام.`,
  },
  {
    regex: /Cannot activate account because its status is '([^']+)'/i,
    replace: (_, status) => `لا يمكن تفعيل الحساب لأن حالته الحالية في النظام هي: (${status}).`,
  },
  {
    regex: /Card cannot be renewed yet\. Renewal is only allowed within 3 months \(90 days\) prior to expiry date\. Remaining valid days:\s*(\d+)/i,
    replace: (_, days) =>
      `لا يمكن تجديد البطاقة الشخصية حالياً؛ التجديد متاح فقط خلال 3 أشهر (90 يوماً) قبل الانتهاء. الأيام المتبقية: ${days} يوماً.`,
  },
  {
    regex: /Family card cannot be renewed yet\. Renewal is only allowed within 3 months \(90 days\) prior to expiry date\. Remaining valid days:\s*(\d+)/i,
    replace: (_, days) =>
      `لا يمكن تجديد البطاقة العائلية حالياً؛ التجديد متاح فقط خلال 3 أشهر (90 يوماً) قبل الانتهاء. الأيام المتبقية: ${days} يوماً.`,
  },
  {
    regex: /Passport cannot be renewed yet\. Renewal is only permitted within 6 months \(180 days\) prior to expiry date\. Remaining valid days:\s*(\d+)/i,
    replace: (_, days) =>
      `لا يمكن تجديد جواز السفر حالياً؛ التجديد متاح فقط خلال 6 أشهر (180 يوماً) قبل الانتهاء. الأيام المتبقية: ${days} يوماً.`,
  },
  {
    regex: /Passport with number '([^']+)' was not found/i,
    replace: (_, num) => `لم يتم العثور على جواز سفر برقم (${num}) في سجلات مصلحة الهجرة والجوازات.`,
  },
  {
    regex: /Cannot issue request:\s*(.*)/i,
    replace: (_, msg) => `تعذر إصدار وثيقة الطلب: ${translateBackendError(msg)}`,
  },
  {
    regex: /Error while fulfilling document issuance:\s*(.*)/i,
    replace: (_, msg) => `حدث خطأ أثناء استكمال إصدار الوثيقة: ${translateBackendError(msg)}`,
  },
  {
    regex: /Malformed JSON payload structure:\s*(.*)/i,
    replace: () => "بيانات الطلب المرسلة غير صالحة البنية أو تفتقر للحقول الإلزامية.",
  },
  {
    regex: /Payload validation error:\s*(.*)/i,
    replace: (_, msg) => `خطأ في التحقق من بيانات المعاملة: ${translateBackendError(msg)}`,
  },
  {
    regex: /Unable to convert '([^']+)' to DateOnly/i,
    replace: (_, val) => `صيغة التاريخ المدخلة (${val}) غير صالحة.`,
  },
  {
    regex: /The '([^']+)' field is required/i,
    replace: (_, field) => `الحقل (${field}) مطلوب ويجب ملؤه.`,
  },
  {
    regex: /The ([a-zA-Z0-9_]+) field is required/i,
    replace: (_, field) => `يرجى إدخال قيمة في الحقل (${field}).`,
  },
  {
    regex: /HTTP Error \((\d+)\)/i,
    replace: (_, code) => `خطأ في استجابة الخادم (رمز الحالة ${code}).`,
  },
];

/**
 * Translates an individual atomic error message
 */
function translateSingle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  // 1. Direct exact match
  if (EXACT_TRANSLATIONS[trimmed]) {
    return EXACT_TRANSLATIONS[trimmed];
  }

  // With / without trailing period
  const withDot = trimmed.endsWith(".") ? trimmed : trimmed + ".";
  if (EXACT_TRANSLATIONS[withDot]) {
    return EXACT_TRANSLATIONS[withDot];
  }
  const withoutDot = trimmed.replace(/\.$/, "");
  if (EXACT_TRANSLATIONS[withoutDot]) {
    return EXACT_TRANSLATIONS[withoutDot];
  }

  // Case-insensitive exact match
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(EXACT_TRANSLATIONS)) {
    if (key.toLowerCase() === lower || key.toLowerCase().replace(/\.$/, "") === lower.replace(/\.$/, "")) {
      return val;
    }
  }

  // 2. Regex pattern match
  for (const { regex, replace } of PATTERN_TRANSLATIONS) {
    const match = trimmed.match(regex);
    if (match) {
      return replace(...match);
    }
  }

  // 3. Common specific phrases
  if (/^district is required/i.test(trimmed)) return "حقل المديرية مطلوب وإلزامي.";
  if (/^address details are required/i.test(trimmed)) return "تفاصيل العنوان مطلوبة وإلزامية.";
  if (/^family id is required/i.test(trimmed)) return "معرّف القيد العائلي مطلوب (يشترط بطاقة عائلية سارية).";
  if (/^hospital branch id is required/i.test(trimmed)) return "معرّف فرع المستشفى مطلوب وإلزامي.";
  if (/^father national number is required/i.test(trimmed)) return "الرقم الوطني للأب مطلوب وإلزامي.";
  if (/^mother national number is required/i.test(trimmed)) return "الرقم الوطني للأم مطلوب وإلزامي.";
  if (/^first name is required/i.test(trimmed)) return "الاسم الأول مطلوب وإلزامي.";
  if (/^date of birth is required/i.test(trimmed)) return "تاريخ الميلاد مطلوب وإلزامي.";
  if (/^place of birth is required/i.test(trimmed)) return "محل الميلاد مطلوب وإلزامي.";
  if (/^governorate is required/i.test(trimmed)) return "حقل المحافظة مطلوب وإلزامي.";
  if (/^national number is required/i.test(trimmed)) return "الرقم الوطني مطلوب وإلزامي.";
  if (/^blood group is required/i.test(trimmed)) return "فصيلة الدم مطلوبة وإلزامية.";
  if (/^marital status is required/i.test(trimmed)) return "الحالة الاجتماعية مطلوبة وإلزامية.";

  // 4. Keyword fallbacks
  if (/not found in civil registry/i.test(trimmed)) {
    return "لم يتم العثور على القيد في السجل المدني.";
  }
  if (/not found/i.test(trimmed)) {
    return "السجل أو البيانات المطلوبة غير موجودة في المنظومة.";
  }
  if (/already exists/i.test(trimmed)) {
    return "السجل أو البيانات المدخلة مسجلة مسبقاً في النظام.";
  }
  if (/unauthorized|forbidden|access denied/i.test(trimmed)) {
    return "ليس لديك الصلاحية الأمنية الكافية لتنفيذ هذا الإجراء.";
  }
  if (/expired/i.test(trimmed)) {
    return "انتهت صلاحية الرمز أو الجلسة، يرجى إعادة المحاولة.";
  }
  if (/invalid/i.test(trimmed)) {
    return "البيانات المدخلة غير صحيحة أو غير صالحة.";
  }

  // Return trimmed text
  return trimmed;
}

/**
 * Main translation function.
 * Converts any raw backend error message (atomic or composite validation list)
 * into clear, formal sovereign Arabic.
 */
export function translateBackendError(rawMessage?: string | null): string {
  if (!rawMessage || typeof rawMessage !== "string") {
    return "حدث خطأ غير متوقع أثناء معالجة الطلب في الخادم.";
  }

  const trimmed = rawMessage.trim();

  // If already pure Arabic without English clauses, return as-is
  const hasArabic = /[\u0600-\u06FF]/.test(trimmed);
  if (hasArabic && !/[a-zA-Z]{3,}/.test(trimmed)) {
    return trimmed;
  }

  // Handle composite validation messages like:
  // "Validation failed. Please correct the highlighted errors.: District is required., Address details are required., Family ID is required."
  const valPrefixMatch = trimmed.match(
    /^(?:Validation failed\.?\s*Please correct the highlighted errors\.?|Validation failed\.?|One or more validation errors occurred\.?)\s*[:：]\s*(.*)$/i
  );
  if (valPrefixMatch) {
    const details = valPrefixMatch[1].trim();
    const subErrors = details
      .split(/(?:\.\s*,\s*|,\s*|\.\s+(?=[A-Z])|;\s*)/)
      .map((s) => s.trim().replace(/\.$/, ""))
      .filter(Boolean);

    if (subErrors.length > 0) {
      const translatedSub = subErrors.map((s) => translateSingle(s));
      return `فشل التحقق من صحة البيانات؛ يرجى استيفاء الحقول المطلوبة: (${translatedSub.join(" • ")})`;
    }
    return "فشل التحقق من صحة البيانات المدخلة؛ يرجى مراجعة الحقول المطلوبة والتأكد من صحتها.";
  }

  // Handle lists joined by "., " or "; " or ", " when containing common validation patterns
  if (
    trimmed.includes(".,") ||
    trimmed.includes("; ") ||
    (trimmed.includes(", ") && /is required|must be|cannot be/i.test(trimmed))
  ) {
    const subErrors = trimmed
      .split(/(?:\.\s*,\s*|;\s*|\.\s+(?=[A-Z])|,\s*(?=[A-Z]))/)
      .map((s) => s.trim().replace(/\.$/, ""))
      .filter(Boolean);

    if (subErrors.length > 1) {
      const translatedSub = subErrors.map((s) => translateSingle(s));
      return translatedSub.join(" • ");
    }
  }

  const singleResult = translateSingle(trimmed);
  if (singleResult !== trimmed) {
    return singleResult;
  }

  // If still completely English and untranslated, format nicely with Arabic prefix
  return hasArabic ? trimmed : `تعذر إتمام الإجراء: ${trimmed}`;
}
