# 🏛️ نظام التحقق من المستخدمين الحكومي
# Government User Verification System

نظام شامل للتحقق من المستخدمين حيث يمكن للحكومة فقط توثيق أو رفض المستخدمين المسجلين.

A comprehensive user verification system where only the government can verify or reject registered users.

## 📋 الميزات الأساسية / Core Features

### ✅ عمليات متاحة / Available Operations:
1. **إنشاء حساب الحكومة** / Initialize Government Account
2. **تسجيل المستخدمين العاديين** / Register Normal Users  
3. **توثيق المستخدمين بواسطة الحكومة** / Government User Verification
4. **رفض المستخدمين** / User Rejection

### 🔒 القيود الأمنية / Security Constraints:
- فقط الحسابات ذات دور `Government` يمكنها التحقق من المستخدمين
- Only accounts with `Government` role can verify users
- لا يمكن للمستخدم التحقق من نفسه
- Users cannot verify themselves
- لا يمكن تغيير حالة المستخدمين المُوثقين أو المرفوضين مسبقاً
- Cannot change status of already verified/rejected users

## 📁 هيكل المشروع / Project Structure

```
src/
├── instructions/
│   ├── register_user.rs      # تسجيل المستخدمين
│   ├── verify_user.rs        # التحقق من المستخدمين
│   ├── initialize_government.rs # إنشاء حساب الحكومة
│   └── mod.rs
├── state/
│   ├── user.rs              # بنية بيانات المستخدم
│   └── mod.rs
├── errors.rs                # أكواد الأخطاء
├── utils.rs                 # الدوال المساعدة
└── lib.rs                   # البرنامج الرئيسي
```

## 🔧 الإعداد والتشغيل / Setup & Usage

### 1. بناء المشروع / Build Project
```bash
anchor build
```

### 2. نشر البرنامج / Deploy Program
```bash
anchor deploy
```

### 3. تشغيل الاختبارات / Run Tests
```bash
anchor test
```

### 4. تشغيل العرض التوضيحي / Run Demo
```bash
node client-demo/verification-demo.js
```

## 🎯 أمثلة الاستخدام / Usage Examples

### إنشاء حساب الحكومة / Initialize Government Account

```javascript
const tx = await program.methods
  .initializeGovernment("Government Authority")
  .accounts({
    governmentAccount: governmentPDA,
    governmentSigner: governmentKeypair.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([governmentKeypair])
  .rpc();
```

### تسجيل مستخدم عادي / Register Normal User

```javascript
const tx = await program.methods
  .registerUser(
    "اسم المستخدم",
    "public_data_uri",
    "private_data_uri", 
    "encrypted_key_for_gov",
    "encrypted_key_for_user",
    { normal: {} } // UserRole
  )
  .accounts({
    userAccount: userPDA,
    authority: userKeypair.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([userKeypair])
  .rpc();
```

### التحقق من المستخدم / Verify User

```javascript
// توثيق المستخدم / Approve User
const tx = await program.methods
  .verifyUser(true) // true = verify, false = reject
  .accounts({
    verifierAccount: governmentPDA,
    targetUserAccount: userPDA,
    verifier: governmentKeypair.publicKey,
  })
  .signers([governmentKeypair])
  .rpc();
```

## 📊 أدوار المستخدمين / User Roles

```rust
pub enum UserRoles {
    Normal,           // مستخدم عادي
    Inspector,        // مفتش
    ConfirmityExpert, // خبير مطابقة
    Government        // حكومة (الوحيد القادر على التوثيق)
}
```

## 🔄 حالات المستخدم / User Status

```rust
pub enum UserStatus {
    Pending,   // في انتظار التوثيق
    Verified,  // موثق
    Rejected   // مرفوض
}
```

## ⚠️ أكواد الأخطاء / Error Codes

| كود الخطأ / Error Code | الوصف / Description |
|------------------------|---------------------|
| `InvalidUserName` | اسم مستخدم غير صالح / Invalid username |
| `UnauthorizedVerifier` | غير مصرح له بالتحقق / Not authorized to verify |
| `UserAlreadyVerified` | المستخدم موثق مسبقاً / User already verified |
| `UserAlreadyRejected` | المستخدم مرفوض مسبقاً / User already rejected |
| `InvalidGovernmentAddress` | عنوان حكومي غير صالح / Invalid government address |
| `CannotVerifySelf` | لا يمكن التحقق من النفس / Cannot verify self |

## 🧪 سيناريوهات الاختبار / Test Scenarios

الاختبارات تغطي السيناريوهات التالية:
The tests cover the following scenarios:

1. ✅ إنشاء حساب حكومي بنجاح / Successful government account creation
2. ✅ تسجيل مستخدم عادي / Normal user registration
3. ✅ توثيق مستخدم بواسطة الحكومة / Government user verification
4. ✅ رفض مستخدم بواسطة الحكومة / Government user rejection
5. ❌ فشل التحقق من مستخدم غير حكومي / Non-government verification failure
6. ❌ فشل التحقق الذاتي / Self-verification failure
7. ❌ فشل إعادة توثيق مستخدم موثق / Re-verification failure
8. ❌ فشل توثيق مستخدم مرفوض / Rejected user verification failure

## 🔐 اعتبارات الأمان / Security Considerations

### ✅ تم تنفيذها / Implemented
- التحقق من دور الحكومة قبل السماح بعمليات التوثيق
- Government role verification before allowing verification operations
- منع التحقق الذاتي
- Prevention of self-verification
- التحقق من حالة المستخدم قبل تغييرها
- User status validation before changes
- استخدام PDAs لضمان أمان الحسابات
- PDA usage for account security

### ⚡ توصيات إضافية / Additional Recommendations
- تطبيق قيود زمنية على عمليات التحقق
- Implement time-based verification constraints
- إضافة سجل للعمليات (Audit Trail)
- Add operation logging (Audit Trail)
- تطبيق آلية التوقيع المتعدد للعمليات الحساسة
- Implement multi-signature for sensitive operations

## 📞 الدعم / Support

للحصول على المساعدة أو الإبلاغ عن مشاكل:
For help or to report issues:

- قم بإنشاء Issue في المستودع
- Create an Issue in the repository
- راجع ملفات الاختبار للأمثلة
- Check test files for examples
- ادرس ملف العرض التوضيحي
- Study the demo file

---

**ملاحظة**: هذا النظام مصمم للاستخدام التجريبي والتطويري. تأكد من إجراء مراجعة أمنية شاملة قبل استخدامه في الإنتاج.

**Note**: This system is designed for experimental and development use. Ensure thorough security review before production usage.