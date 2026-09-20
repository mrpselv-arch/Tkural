package com.ext.techapp.thirukkural.xml;

import android.util.Xml;

import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

/**
 * Created by Selvam on 10/2/2015.
 */
public class CoupletsXMLParser implements Serializable {
    private static final String ns = null;

    public CoupletsXMLParser() {
    }

    public Couplet[] getCouplets(String chapter_code, InputStream inputStream) throws XmlPullParserException, IOException {
        Couplet[] couplets = new Couplet[10];
        Map<Integer, Couplet> full_list = coupletsList(inputStream);
        int i = 0;
        for (Map.Entry entry : full_list.entrySet()) {
            System.out.print("hello :" + entry.getValue());
            Couplet couplet = (Couplet) entry.getValue();
            if (couplet.getChapterCode().equals(chapter_code)) {
                couplets[i] = couplet;
                i++;
            }
        }
        return couplets;
    }

    public Map coupletsList(InputStream in) throws XmlPullParserException, IOException {
        Map<Integer, Couplet> couplets = parse(in);
        return couplets;
    }


    public Map parse(InputStream in) throws XmlPullParserException, IOException {
        try {
            XmlPullParser parser = Xml.newPullParser();
            parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, false);
            parser.setInput(in, null);
            parser.nextTag();
            return readCouplets(parser);
        } finally {
            in.close();
        }
    }

    private Map readCouplets(XmlPullParser parser) throws XmlPullParserException, IOException {
        Map<Integer, Couplet> entries = new HashMap<Integer, Couplet>();
        parser.require(XmlPullParser.START_TAG, ns, "couplets");
        while (parser.next() != XmlPullParser.END_TAG) {
            if (parser.getEventType() != XmlPullParser.START_TAG) {
                continue;
            }
            String name = parser.getName();
            // Starts by looking for the entry tag
            if (name.equals("couplet")) {
                Couplet couplet = readRecord(parser);
                int kuralEn = Integer.valueOf(couplet.coupletNumber);
                entries.put(kuralEn, couplet);
            } else {
                skip(parser);
            }

        }
        Map<Integer, Couplet> map = new TreeMap<Integer, Couplet>(entries);
        return map;
    }

    private void skip(XmlPullParser parser) throws XmlPullParserException, IOException {
        if (parser.getEventType() != XmlPullParser.START_TAG) {
            throw new IllegalStateException();
        }
        int depth = 1;
        while (depth != 0) {
            switch (parser.next()) {
                case XmlPullParser.END_TAG:
                    depth--;
                    break;
                case XmlPullParser.START_TAG:
                    depth++;
                    break;
            }
        }
    }

    // Parses the contents of an entry. If it encounters a title, summary, or link tag, hands them off
// to their respective "read" methods for processing. Otherwise, skips the tag.
    private Couplet readRecord(XmlPullParser parser) throws XmlPullParserException, IOException {
        parser.require(XmlPullParser.START_TAG, ns, "couplet");
        String muvaExplanation = null;
        String solomonExplanation = null;
        String kalaignarExplanation = null;
        String chapterNameTamil = null;
        String chapterNameEnglish = null;
        String chapterCode = null;
        String firstLineTamil = null;
        String secondLineTamil = null;
        String englishExplanation = null;
        String firstLineEnglish = null;
        String secondLineEnglish = null;
        String coupletNumber = null;
        coupletNumber = parser.getAttributeValue(null, "id");
        while (parser.next() != XmlPullParser.END_TAG) {
            if (parser.getEventType() != XmlPullParser.START_TAG) {
                continue;
            }
            String name = parser.getName();

            if (name.equals("firstLine")) {
                firstLineTamil = readFirstLineTamil(parser);
            } else if (name.equals("secondLine")) {
                secondLineTamil = readSecondLineTamil(parser);
            } else if (name.equals("muva")) {
                muvaExplanation = readMuvaExplanation(parser);
            } else if (name.equals("solomon")) {
                solomonExplanation = readSolomonExplanation(parser);
            } else if (name.equals("kalaignar")) {
                kalaignarExplanation = readKalaignarExplanation(parser);
            } else if (name.equals("chapter")) {
                Chapter chapter = readChapter(parser);
                chapterNameEnglish = chapter.chapterEnglish;
                chapterNameTamil = chapter.chapterTamil;
                chapterCode = chapter.chapterCode;
            } else if (name.equals("english")) {
                English english = readEnglish(parser);
                firstLineEnglish = english.firstLine;
                secondLineEnglish = english.secondLine;
                englishExplanation = english.explanation;
            } else {
                skip(parser);
            }
        }
        Couplet couplet = new Couplet(coupletNumber, muvaExplanation, solomonExplanation, kalaignarExplanation,
                chapterNameTamil, chapterNameEnglish, chapterCode,
                firstLineTamil, secondLineTamil, englishExplanation,
                firstLineEnglish, secondLineEnglish);
        return couplet;
    }

    // Processes title tags in the feed
    private String readMuvaExplanation(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "muva");
        String english = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "muva");
        return english;
    }

    private String readSolomonExplanation(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "solomon");
        String english = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "solomon");
        return english;
    }

    private String readKalaignarExplanation(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "kalaignar");
        String english = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "kalaignar");
        return english;
    }

    // Processes title tags in the feed.
    private Chapter readChapter(XmlPullParser parser) throws IOException, XmlPullParserException {
        String chapterCode = null;
        String chapterEnglish = null;
        String chapterTamil = null;

        parser.require(XmlPullParser.START_TAG, ns, "chapter");
        chapterCode = parser.getAttributeValue(null, "id");
        while (parser.next() != XmlPullParser.END_TAG) {
            if (parser.getEventType() != XmlPullParser.START_TAG) {
                continue;
            }
            String name = parser.getName();
            // Starts by looking for the entry tag
            if (name.equals("inEnglish")) {
                chapterEnglish = readChapterEnglish(parser);
            } else if (name.equals("inTamil")) {
                chapterTamil = readChapterTamil(parser);
            } else {
                skip(parser);
            }
        }
        // parser.require(XmlPullParser.END_TAG, ns, "chapter");

        Chapter chapter = new Chapter(chapterCode, chapterEnglish, chapterTamil);
        return chapter;
    }

    private English readEnglish(XmlPullParser parser) throws IOException, XmlPullParserException {
        String firstLine = null;
        String secondLine = null;
        String explanation = null;

        parser.require(XmlPullParser.START_TAG, ns, "english");

        while (parser.next() != XmlPullParser.END_TAG) {
            if (parser.getEventType() != XmlPullParser.START_TAG) {
                continue;
            }
            String name = parser.getName();
            // Starts by looking for the entry tag
            if (name.equals("firstLine")) {
                firstLine = readEnglishFirstLine(parser);
            } else if (name.equals("secondLine")) {
                secondLine = readEnglishSecondLine(parser);
            } else if (name.equals("explanation")) {
                explanation = readEnglishExplanation(parser);
            } else {
                skip(parser);
            }
        }

        // String chapter = readText(parser);
        //parser.require(XmlPullParser.END_TAG, ns, "english");

        English english = new English(firstLine, secondLine, explanation);
        return english;
    }

    // Processes link tags in the feed.
    private String readLink(XmlPullParser parser) throws IOException, XmlPullParserException {
        String link = "";
        parser.require(XmlPullParser.START_TAG, ns, "link");
        String tag = parser.getName();
        String relType = parser.getAttributeValue(null, "rel");
        if (tag.equals("link")) {
            if (relType.equals("alternate")) {
                link = parser.getAttributeValue(null, "href");
                parser.nextTag();
            }
        }
        parser.require(XmlPullParser.END_TAG, ns, "link");
        return link;
    }

    private String readEnglishFirstLine(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "firstLine");
        String tamil = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "firstLine");
        return tamil;
    }

    private String readEnglishSecondLine(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "secondLine");
        String tamil = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "secondLine");
        return tamil;
    }

    private String readEnglishExplanation(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "explanation");
        String tamil = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "explanation");
        return tamil;
    }

    private String readChapterEnglish(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "inEnglish");
        String tamil = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "inEnglish");
        return tamil;
    }

    private String readChapterTamil(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "inTamil");
        String tamil = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "inTamil");
        return tamil;
    }

    // Processes summary tags in the feed.
    private String readFirstLineTamil(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "firstLine");
        String tamil = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "firstLine");
        return tamil;
    }

    private String readSecondLineTamil(XmlPullParser parser) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, "secondLine");
        String tamil = readText(parser);
        parser.require(XmlPullParser.END_TAG, ns, "secondLine");
        return tamil;
    }

    // For the tags title and summary, extracts their text values.
    private String readText(XmlPullParser parser) throws IOException, XmlPullParserException {
        String result = "";
        if (parser.next() == XmlPullParser.TEXT) {
            result = parser.getText();
            parser.nextTag();
        }
        return result;
    }

    public static class Couplet implements Serializable {
        private String muvaExplanation;
        private String solomonExplanation;
        private String kalaignarExplanation;
        private String chapterNameTamil;
        private String chapterNameEnglish;
        private String chapterCode;
        private String firstLineTamil;
        private String secondLineTamil;
        private String englishExplanation;
        private String firstLineEnglish;
        private String secondLineEnglish;
        private String coupletNumber;


        public Couplet(String coupletNumber, String muvaExplanation, String solomonExplanation, String kalaignarExplanation,
                       String chapterNameTamil, String chapterNameEnglish, String chapterCode,
                       String firstLineTamil, String secondLineTamil, String englishExplanation,
                       String firstLineEnglish, String secondLineEnglish) {
            this.muvaExplanation = muvaExplanation;
            this.solomonExplanation = solomonExplanation;
            this.kalaignarExplanation = kalaignarExplanation;
            this.chapterNameTamil = chapterNameTamil;
            this.chapterNameEnglish = chapterNameEnglish;
            this.chapterCode = chapterCode;
            this.firstLineTamil = firstLineTamil;
            this.secondLineTamil = secondLineTamil;
            this.englishExplanation = englishExplanation;
            this.firstLineEnglish = firstLineEnglish;
            this.secondLineEnglish = secondLineEnglish;
            this.coupletNumber = coupletNumber;
        }

        public String getMuvaExplanation() {
            return muvaExplanation;
        }

        public void setMuvaExplanation(String muvaExplanation) {
            this.muvaExplanation = muvaExplanation;
        }

        public String getSolomonExplanation() {
            return solomonExplanation;
        }

        public void setSolomonExplanation(String solomonExplanation) {
            this.solomonExplanation = solomonExplanation;
        }

        public String getKalaignarExplanation() {
            return kalaignarExplanation;
        }

        public void setKalaignarExplanation(String kalaignarExplanation) {
            this.kalaignarExplanation = kalaignarExplanation;
        }

        public String getChapterNameTamil() {
            return chapterNameTamil;
        }

        public void setChapterNameTamil(String chapterNameTamil) {
            this.chapterNameTamil = chapterNameTamil;
        }

        public String getChapterNameEnglish() {
            return chapterNameEnglish;
        }

        public void setChapterNameEnglish(String chapterNameEnglish) {
            this.chapterNameEnglish = chapterNameEnglish;
        }

        public String getChapterCode() {
            return chapterCode;
        }

        public void setChapterCode(String chapterCode) {
            this.chapterCode = chapterCode;
        }

        public String getFirstLineTamil() {
            return firstLineTamil;
        }

        public void setFirstLineTamil(String firstLineTamil) {
            this.firstLineTamil = firstLineTamil;
        }

        public String getSecondLineTamil() {
            return secondLineTamil;
        }

        public void setSecondLineTamil(String secondLineTamil) {
            this.secondLineTamil = secondLineTamil;
        }

        public String getEnglishExplanation() {
            return englishExplanation;
        }

        public void setEnglishExplanation(String englishExplanation) {
            this.englishExplanation = englishExplanation;
        }

        public String getFirstLineEnglish() {
            return firstLineEnglish;
        }

        public void setFirstLineEnglish(String firstLineEnglish) {
            this.firstLineEnglish = firstLineEnglish;
        }

        public String getSecondLineEnglish() {
            return secondLineEnglish;
        }

        public void setSecondLineEnglish(String secondLineEnglish) {
            this.secondLineEnglish = secondLineEnglish;
        }

        public String getCoupletNumber() {
            return coupletNumber;
        }

        public void setCoupletNumber(String coupletNumber) {
            this.coupletNumber = coupletNumber;
        }
    }

    public static class Chapter {
        private String chapterCode;
        private String chapterEnglish;
        private String chapterTamil;

        public Chapter(String chapterCode, String chapterEnglish, String chapterTamil) {
            this.chapterCode = chapterCode;
            this.chapterEnglish = chapterEnglish;
            this.chapterTamil = chapterTamil;
        }
    }

    public static class English {
        private String firstLine;
        private String secondLine;
        private String explanation;

        public English(String firstLine, String secondLine, String explanation) {
            this.firstLine = firstLine;
            this.secondLine = secondLine;
            this.explanation = explanation;
        }
    }

}
