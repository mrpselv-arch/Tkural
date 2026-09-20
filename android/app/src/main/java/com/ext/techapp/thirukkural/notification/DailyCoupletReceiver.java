package com.ext.techapp.thirukkural.notification;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.TaskStackBuilder;

import com.ext.techapp.thirukkural.ItemDetailActivity;
import com.ext.techapp.thirukkural.R;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * Modernized for Android 14 (API 34) with NotificationChannel & FLAG_IMMUTABLE
 */
public class DailyCoupletReceiver extends BroadcastReceiver {

    public static final String NOTIFICATION_ID = "notification-id";
    public static final String NOTIFICATION = "notification";
    public static final String CHANNEL_ID = "daily_thirukkural_channel";
    private static int notifyId = 0;

    @Override
    public void onReceive(Context context, Intent dailyIntent) {
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager == null) return;

        // Android 8.0+ (Oreo) to Android 14 Notification Channel setup
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    context.getString(R.string.notification_channel_name),
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription(context.getString(R.string.notification_channel_desc));
            notificationManager.createNotificationChannel(channel);
        }

        NotificationCompat.Builder mBuilder =
                new NotificationCompat.Builder(context, CHANNEL_ID)
                        .setSmallIcon(R.drawable.ic_stat_t)
                        .setContentTitle("இன்றைய குறள்");

        final Intent detailIntent = new Intent(context.getApplicationContext(), NotificationDetailActivity.class);

        CoupletsXMLParser.Couplet couplet = getCouplet(context);
        if (couplet == null) return;

        detailIntent.putExtra("couplet_number", couplet.getCoupletNumber());
        detailIntent.putExtra("selected_couplet", couplet);

        TaskStackBuilder stackBuilder = TaskStackBuilder.create(context);
        stackBuilder.addParentStack(NotificationDetailActivity.class);
        stackBuilder.addNextIntent(detailIntent);

        // Android 12+ / 14 requires explicit FLAG_IMMUTABLE
        int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent resultPendingIntent = stackBuilder.getPendingIntent(0, pendingFlags);
        mBuilder.setContentIntent(resultPendingIntent);

        mBuilder.setContentText(couplet.getFirstLineTamil() + "\n" + couplet.getSecondLineTamil());
        mBuilder.setStyle(new NotificationCompat.BigTextStyle().bigText(
                couplet.getFirstLineTamil() + "\n" + couplet.getSecondLineTamil() +
                "\n\nஉரை: " + couplet.getMuvaExplanation()
        ));

        mBuilder.setAutoCancel(true);
        Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        mBuilder.setSound(alarmSound);

        Notification notification = mBuilder.build();
        notificationManager.notify(notifyId++, notification);
    }

    private CoupletsXMLParser.Couplet getCouplet(Context context) {
        int min = 1;
        int max = 133;
        int chapter_code = min + (int) (Math.random() * ((max - min) + 1));

        int id = context.getResources().getIdentifier("chapter_" + chapter_code, "raw", context.getPackageName());
        if (id == 0) return null;
        InputStream in = context.getResources().openRawResource(id);
        CoupletsXMLParser.Couplet couplet = null;
        try {
            Map<Integer, CoupletsXMLParser.Couplet> coupletsMap = new CoupletsXMLParser().coupletsList(in);
            CoupletsXMLParser.Couplet[] couplet_list_to_show = new CoupletsXMLParser.Couplet[10];
            int i = 0;
            for (Object key : coupletsMap.keySet()) {
                CoupletsXMLParser.Couplet kural = coupletsMap.get(key);
                couplet_list_to_show[i] = kural;
                i++;
                if (i >= 10) break;
            }

            int kural = (int) (Math.random() * 10);
            couplet = couplet_list_to_show[kural];
        } catch (XmlPullParserException | IOException e) {
            e.printStackTrace();
        }
        return couplet;
    }
}

