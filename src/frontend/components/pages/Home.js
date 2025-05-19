import React from 'react';
import { Link } from 'react-router-dom';
import Alert from '../layout/Alert';

const Home = () => {
  return (
    <div className="home-page">
      <Alert />
      
      <div className="card mb-3">
        <h1 className="text-center mb-3">معالج البيانات العربية</h1>
        <p className="text-center mb-3">
          نظام متكامل لتحضير مجموعات بيانات من ملفات PDF العربية المصورة لتدريب نماذج الذكاء الاصطناعي
        </p>
        
        <div className="grid mt-3">
          <div className="col-4">
            <div className="card p-3 text-center">
              <h3 className="mb-2">رفع الملفات</h3>
              <p className="mb-2">قم برفع ملفات PDF العربية المصورة بسهولة</p>
              <Link to="/upload" className="btn btn-primary">ابدأ الآن</Link>
            </div>
          </div>
          
          <div className="col-4">
            <div className="card p-3 text-center">
              <h3 className="mb-2">معالجة النصوص</h3>
              <p className="mb-2">استخراج وتنظيف النصوص العربية من الملفات المصورة</p>
              <Link to="/process" className="btn btn-secondary">معالجة الملفات</Link>
            </div>
          </div>
          
          <div className="col-4">
            <div className="card p-3 text-center">
              <h3 className="mb-2">مجموعات البيانات</h3>
              <p className="mb-2">إنشاء وتصدير مجموعات البيانات بتنسيقات مختلفة</p>
              <Link to="/dataset" className="btn btn-success">إدارة البيانات</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mb-3">
        <h2 className="mb-2">كيفية الاستخدام</h2>
        <ol>
          <li className="mb-1">
            <strong>رفع الملفات:</strong> قم برفع ملفات PDF العربية المصورة من خلال واجهة سهلة الاستخدام.
          </li>
          <li className="mb-1">
            <strong>معالجة النصوص:</strong> استخدم تقنية التعرف الضوئي على الحروف (OCR) المخصصة للغة العربية لاستخراج النصوص من الملفات المصورة.
          </li>
          <li className="mb-1">
            <strong>تنظيف البيانات:</strong> تنظيف وتطبيع النصوص العربية المستخرجة تلقائيًا.
          </li>
          <li className="mb-1">
            <strong>تحرير النتائج:</strong> مراجعة وتحرير النصوص المستخرجة يدويًا إذا لزم الأمر.
          </li>
          <li className="mb-1">
            <strong>إنشاء مجموعات البيانات:</strong> تنظيم البيانات المعالجة في تنسيقات منظمة (CSV، JSON) مناسبة للتدريب.
          </li>
          <li className="mb-1">
            <strong>تصدير البيانات:</strong> تصدير مجموعات البيانات النهائية لاستخدامها في تدريب نماذج الذكاء الاصطناعي.
          </li>
        </ol>
      </div>
      
      <div className="card">
        <h2 className="mb-2">المميزات</h2>
        <div className="grid">
          <div className="col-6">
            <ul>
              <li className="mb-1">واجهة مستخدم سهلة وبديهية</li>
              <li className="mb-1">دعم رفع ملفات متعددة في وقت واحد</li>
              <li className="mb-1">تقنية OCR مخصصة للغة العربية</li>
              <li className="mb-1">معالجة تلقائية للنصوص العربية</li>
            </ul>
          </div>
          <div className="col-6">
            <ul>
              <li className="mb-1">إمكانية معاينة الملفات والنصوص المستخرجة</li>
              <li className="mb-1">أدوات تحرير تفاعلية لتصحيح النتائج</li>
              <li className="mb-1">تصدير البيانات بتنسيقات متعددة</li>
              <li className="mb-1">تتبع تقدم المعالجة بشكل مرئي</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
