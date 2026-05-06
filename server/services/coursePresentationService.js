import mongoose from "mongoose";

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const getEffectiveCoursePrice = (course) => {
    const basePrice = Number(course?.coursePrice || 0);
    const discount = Number(course?.discount || 0);

    if (basePrice <= 0) return 0;

    const discountedPrice = basePrice - (basePrice * discount) / 100;
    return Math.max(0, Number(discountedPrice.toFixed(2)));
};

export const getCourseStats = (course) => {
    const courseContent = Array.isArray(course?.courseContent) ? course.courseContent : [];
    const enrolledStudents = Array.isArray(course?.enrolledStudents) ? course.enrolledStudents : [];
    const ratings = Array.isArray(course?.courseRatings) ? course.courseRatings : [];

    const lectureCount = courseContent.reduce((total, chapter) => {
        const chapterContent = Array.isArray(chapter?.chapterContent) ? chapter.chapterContent : [];
        return total + chapterContent.length;
    }, 0);

    const durationMinutes = courseContent.reduce((total, chapter) => {
        const chapterContent = Array.isArray(chapter?.chapterContent) ? chapter.chapterContent : [];
        return total + chapterContent.reduce((chapterTotal, lecture) => chapterTotal + Number(lecture?.lectureDuration || 0), 0);
    }, 0);

    const averageRating = ratings.length
        ? Number((ratings.reduce((sum, entry) => sum + Number(entry?.rating || 0), 0) / ratings.length).toFixed(1))
        : 0;

    return {
        averageRating,
        lectureCount,
        chapterCount: courseContent.length,
        durationMinutes,
        enrollmentCount: enrolledStudents.length,
        reviewCount: ratings.length,
        effectivePrice: getEffectiveCoursePrice(course),
    };
};

export const buildPublicCoursePayload = (course) => {
    const courseObject = typeof course?.toObject === "function" ? course.toObject() : { ...course };

    if (Array.isArray(courseObject.courseContent)) {
        courseObject.courseContent = courseObject.courseContent.map((chapter) => ({
            ...chapter,
            chapterContent: Array.isArray(chapter?.chapterContent)
                ? chapter.chapterContent.map((lecture) => ({
                    ...lecture,
                    lectureUrl: lecture?.isPreviewFree ? lecture.lectureUrl : "",
                }))
                : [],
        }));
    }

    return {
        ...courseObject,
        stats: getCourseStats(courseObject),
    };
};
